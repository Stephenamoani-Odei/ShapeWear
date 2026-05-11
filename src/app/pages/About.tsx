import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Target, Users, Award, Heart } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function About() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[60vh] flex items-center pt-16">
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1600&q=80"
            alt="About SHAPEWEAR"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div data-aos="fade-up" className="max-w-3xl">
            <h1 className="text-white mb-6">About SHAPEWEAR</h1>
            <p className="text-white/90 text-xl">
              Empowering athletes and fitness enthusiasts with premium equipment designed for peak performance.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div data-aos="fade-right">
              <h2 className="mb-6">Our Mission</h2>
              <p className="text-gray-600 mb-4">
                At SHAPEWEAR, we believe that everyone deserves access to high-quality fitness equipment that enhances their training and helps them achieve their goals.
              </p>
              <p className="text-gray-600 mb-4">
                Founded by athletes for athletes, we understand the importance of reliable, durable, and innovative fitness gear. Every product we offer has been rigorously tested and approved by our team of professional trainers and athletes.
              </p>
              <p className="text-gray-600">
                We're committed to sustainability, quality craftsmanship, and exceptional customer service. Your fitness journey is our priority.
              </p>
            </div>
            <div data-aos="fade-left">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80"
                alt="Our mission"
                className="w-full h-[400px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-aos="fade-up" className="text-center mb-16">
            <h2 className="mb-4">Our Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div data-aos="fade-up" data-aos-delay="0" className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                  <Target className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="font-semibold mb-2">Performance First</h3>
              <p className="text-gray-600 text-sm">
                Every product is designed and tested for maximum performance and durability.
              </p>
            </div>

            <div data-aos="fade-up" data-aos-delay="100" className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="font-semibold mb-2">Community Driven</h3>
              <p className="text-gray-600 text-sm">
                We listen to our customers and continuously improve based on their feedback.
              </p>
            </div>

            <div data-aos="fade-up" data-aos-delay="200" className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                  <Award className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="font-semibold mb-2">Quality Excellence</h3>
              <p className="text-gray-600 text-sm">
                We never compromise on quality. Every product meets our rigorous standards.
              </p>
            </div>

            <div data-aos="fade-up" data-aos-delay="300" className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                  <Heart className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="font-semibold mb-2">Sustainability</h3>
              <p className="text-gray-600 text-sm">
                We're committed to eco-friendly materials and sustainable manufacturing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-aos="fade-up" className="text-center mb-16">
            <h2 className="mb-4">Our Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Meet the experts behind SHAPEWEAR
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Founder & CEO',
                image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
              },
              {
                name: 'Michael Chen',
                role: 'Head of Product',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
              },
              {
                name: 'Emily Rodriguez',
                role: 'Lead Designer',
                image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
              },
            ].map((member, index) => (
              <div key={index} data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="aspect-square overflow-hidden mb-4">
                  <ImageWithFallback
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                <h3 className="font-semibold mb-1">{member.name}</h3>
                <p className="text-gray-600 text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div data-aos="fade-up">
            <h2 className="text-white mb-4">Ready to Start Your Journey?</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Explore our collection of premium fitness equipment and gear.
            </p>
            <a
              href="/shop"
              className="inline-block px-8 py-4 bg-white text-black font-semibold hover:bg-gray-200 transition-colors"
            >
              Shop Now
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
