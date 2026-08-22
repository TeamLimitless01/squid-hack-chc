"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/src/lib/db";
import Razorpay from "razorpay";
import crypto from "crypto";
import { notifyBookingUpdate } from "@/src/lib/pusherServer";

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "mock_key_id",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "mock_key_secret",
});

export async function createPaymentOrder(bookingId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) throw new Error("User not found");

    // Fetch the booking and calculate total amount
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        chcService: true,
        chc: true,
        additionalCharges: true,
      }
    });

    if (!booking) throw new Error("Booking not found");
    if (booking.farmerId !== user.id) throw new Error("Unauthorized access to booking");
    if (booking.workStatus !== "COMPLETED") throw new Error("Work is not yet completed");

    // Calculate total
    let totalAmount = booking.chcService.price * booking.area;
    totalAmount += booking.additionalCharges.reduce(
      (sum, charge) => sum + charge.amount,
      0,
    );

    // Amount should be in paisa for Razorpay (multiply by 100)
    const amountInPaisa = Math.round(totalAmount * 100);

    // Create an order in Razorpay
    const options = {
      amount: amountInPaisa,
      currency: "INR",
      receipt: `receipt_${booking.id.substring(0, 10)}`,
    };

    const order = await razorpay.orders.create(options);

    if (!order) throw new Error("Failed to create Razorpay order");

    // Upsert the Payment record in our DB
    const payment = await prisma.payment.upsert({
      where: { bookingId: booking.id },
      update: {
        amount: totalAmount,
        razorpayOrderId: order.id,
        status: "created"
      },
      create: {
        bookingId: booking.id,
        farmerId: user.id,
        chcId: booking.chcId,
        amount: totalAmount,
        razorpayOrderId: order.id,
        status: "created"
      }
    });

    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    };

  } catch (error: any) {
    console.error("Error creating payment order:", error);
    return { success: false, error: error.message || "Failed to create order" };
  }
}

export async function verifyPayment(
  bookingId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) throw new Error("Unauthorized");

    const secret = process.env.RAZORPAY_KEY_SECRET || "mock_key_secret";

    // Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      // For development/mock purposes, if keys aren't set up perfectly, you might want to bypass this in strict mode.
      // But we will keep standard verification.
      throw new Error("Invalid payment signature");
    }

    // Signature matches, update payment record
    await prisma.payment.update({
      where: { razorpayOrderId },
      data: {
        status: "PAID",
        razorpayPaymentId,
        razorpaySignature,
        paidAt: new Date(),
      }
    });

    await notifyBookingUpdate(bookingId);
    return { success: true };

  } catch (error: any) {
    console.error("Payment verification failed:", error);

    // Attempt to mark as failed
    try {
      await prisma.payment.update({
        where: { razorpayOrderId },
        data: { status: "FAILED" }
      });
    } catch (e) { }

    return { success: false, error: error.message || "Verification failed" };
  }
}

export async function payInCash(bookingId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) throw new Error("User not found");

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { chcService: true }
    });

    if (!booking) throw new Error("Booking not found");
    if (booking.farmerId !== user.id) throw new Error("Unauthorized access to booking");
    if (booking.workStatus !== "COMPLETED") throw new Error("Work is not yet completed");

    // We can use vpFinalAmount directly if available, otherwise calculate it
    const totalAmount = booking.vpFinalAmount || (booking.chcService.price * booking.area);

    await prisma.payment.upsert({
      where: { bookingId: booking.id },
      update: {
        amount: totalAmount,
        method: "CASH",
        status: "CASH_PENDING",
      },
      create: {
        bookingId: booking.id,
        farmerId: user.id,
        chcId: booking.chcId,
        amount: totalAmount,
        method: "CASH",
        status: "CASH_PENDING",
        razorpayOrderId: `cash_${booking.id}_${Date.now()}` // Mock order ID for unique constraint
      }
    });

    await notifyBookingUpdate(bookingId);
    return { success: true };
  } catch (error: any) {
    console.error("Error requesting cash payment:", error);
    return { success: false, error: error.message || "Failed to process cash request" };
  }
}
