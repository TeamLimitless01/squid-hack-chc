"use client";

import { useEffect } from "react";
import { pusherClient } from "@/src/lib/pusher";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export function PusherListener() {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (!pusherClient || !session?.user) return;

    // Determine channel name based on user role
    const user = session.user as any;
    let channelName = "";
    
    if (user.role === "farmer") {
      channelName = `farmer-${user.id}`;
    } else if (user.role === "chc" || user.role === "driver") {
      // Both CHC and Driver use their profile ID to match the server-side channel naming
      channelName = `${user.role}-${user.profileId}`;
    }

    if (!channelName) return;

    // Subscribe to the specific channel
    const channel = pusherClient.subscribe(channelName);

    // Listen for booking updates
    channel.bind("booking-updated", (data: any) => {
      console.log("Booking updated in real-time:", data);

      // Refresh the current route to fetch the latest server components data
      router.refresh();
    });

    return () => {
      pusherClient.unsubscribe(channelName);
    };
  }, [router, session]);

  return null;
}
