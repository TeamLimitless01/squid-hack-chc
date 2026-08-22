import prisma from "@/src/lib/db";
import { Tractor, Sprout, Leaf, Wind, Map, ShieldCheck, ShoppingCart } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";

const getServiceIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("cultivat")) return Sprout;
  if (n.includes("plough")) return Leaf;
  if (n.includes("sow")) return Wind;
  if (n.includes("harvest")) return ShoppingCart;
  if (n.includes("spray")) return ShieldCheck;
  if (n.includes("land") || n.includes("rota")) return Map;
  return Tractor;
};

const getServiceImage = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("cultivat")) return "https://www.mahindratractor.com/sites/default/files/2025-07/Blog%2010%20Guide%20to%20Tractor%20Cultivator%20Types%2C%20Benefits%2C%20and%20How%20to%20Attach%20Them-Detail.webp";
  if (n.includes("plough")) return "https://image.made-in-china.com/2f0j00JFTlUtBRvYfo/Agricultural-Disc-Plough-Small-Ploughing-Machine-Hand-Plowing-Machine.jpg";
  if (n.includes("sow")) return "https://www.anja.com.tw/comm/upimage/p-170516-04014.jpg";
  if (n.includes("rota")) return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuRLFxsTgtT_eHX-8xsd-JSWzGhmsropIiM5uheGSDEj1WGE4fhg5ojB9j&s=10";
  if (n.includes("spray")) return "https://5.imimg.com/data5/SELLER/Default/2022/9/PR/DM/QH/92976206/tractor-mounted-boom-sprayer.jpeg";
  if (n.includes("harvest")) return "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&q=80&w=800";
  if (n.includes("transport")) return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGOTn_yzxD1y58QCnWMxS1qKuHfxmqbvIUTnySeaXo3jNfycIc67tjwqmc&s=10"; // Trailer/transport
  return "https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?auto=format&fit=crop&q=80&w=800"; // Generic land prep
};

export default async function ServicesPage() {
  const services = await prisma.platformService.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" }
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-grow pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
              Agricultural Services
            </h1>
            <p className="text-xl text-gray-600">
              Browse our standard list of agricultural services. Find trusted Custom Hiring Centres in your area that provide exactly what your farm needs.
            </p>
          </div>

          {services.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
              <Tractor className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Services Found</h3>
              <p className="text-gray-500">We are currently updating our service catalog. Check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {services.map((service) => {
                const Icon = getServiceIcon(service.name);
                const imageUrl = getServiceImage(service.name);

                return (
                  <div
                    key={service.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-xl hover:border-brand-200 transition-all group overflow-hidden"
                  >
                    {/* Image Header */}
                    <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                      <img
                        src={imageUrl}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      {/* Floating Icon */}
                      <div className="absolute top-4 right-4 w-12 h-12 bg-white/95 backdrop-blur rounded-xl flex items-center justify-center shadow-sm">
                        <Icon className="w-6 h-6 text-brand-600" />
                      </div>
                    </div>

                    <div className="p-8 flex flex-col flex-grow">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.name}</h3>
                      <p className="text-gray-600 mb-8 flex-grow leading-relaxed">
                        {service.description}
                      </p>

                      <div className="pt-6 border-t border-gray-100 mt-auto">
                        {/* <div className="flex justify-between items-center mb-6">
                          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                            Pricing Unit
                          </span>
                          <span className="bg-brand-50 text-brand-700 text-xs font-bold px-3 py-1 rounded-full">
                            Per {service.pricingUnit}
                          </span>
                        </div> */}

                        <Link
                          href={`/chc/services?category=${service.id}`}
                          className="block w-full text-center bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-brand-600 transition-colors active:scale-95"
                        >
                          Get Services
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
