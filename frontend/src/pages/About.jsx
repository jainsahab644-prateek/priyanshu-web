import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { Award, Compass, Heart, Users } from 'lucide-react';

const About = () => {
  const { settings } = useSettings();

  const title = settings?.aboutPageContent?.title || 'Preserving Indian Heritage Since 1998';
  const story = settings?.aboutPageContent?.story || 'Bani Thani Textiles is born from a desire to celebrate the rich tradition of Indian handloom. Inspired by classic Rajasthani Bani Thani miniature arts representing sheer poise and traditional beauty, we source the finest sarees from craft hubs across India.';
  const features = settings?.aboutPageContent?.features || [
    '100% Genuine Weaves: Direct associations with handloom clusters.',
    'Quality Assured: Rigorous standards on silks, zari content, and embellishments.',
    'Artisan Support: Supporting traditional weaver families across Rajasthan, Banaras, and Kanchipuram.'
  ];

  return (
    <div className="pb-16">
      {/* Banner */}
      <section className="bg-primary text-white py-16 text-center select-none border-b border-gold/30">
        <div className="max-w-4xl mx-auto px-4">
          <span className="text-gold uppercase tracking-[0.2em] text-xs font-semibold block mb-2">Our Legacy</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-wide">About Bani Thani Textiles</h1>
          <div className="w-16 h-0.5 bg-gold mx-auto mt-4" />
        </div>
      </section>

      {/* Main Story Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center sm:text-left">
        <div className="bg-white border border-cream-dark/30 rounded-lg p-8 sm:p-12 shadow-sm gold-border-glow">
          <h2 className="font-serif text-2xl font-bold text-primary mb-6">{title}</h2>
          
          <div className="text-charcoal-light text-sm sm:text-base leading-relaxed space-y-6 font-light">
            <p>{story}</p>
            <p>
              We believe a saree is not just an attire; it is a canvas of cultural expressions. By bringing these masterfully-weaved fabrics online, we aim to make high-end traditional Indian fashion accessible, allowing customers worldwide to browse, choose, and book customized selections.
            </p>
          </div>

          {/* Key Value Items */}
          <div className="border-t border-cream-dark/20 pt-8 mt-8">
            <h3 className="font-serif text-xs font-bold uppercase tracking-widest text-primary mb-4 text-center sm:text-left">
              Why Customers Choose Us
            </h3>
            <ul className="space-y-3 text-xs text-charcoal-light font-medium text-left">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="text-gold font-bold text-sm leading-none shrink-0">•</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Philosophy Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white p-8 rounded-lg border border-cream-dark/20 shadow-sm text-center">
            <div className="w-12 h-12 bg-cream border border-gold/45 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-charcoal font-semibold text-base mb-2">Our Mission</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-light">
              To keep the dying art forms of Indian handloom alive by bridging master craft weavers with contemporary buyers.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg border border-cream-dark/20 shadow-sm text-center">
            <div className="w-12 h-12 bg-cream border border-gold/45 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-charcoal font-semibold text-base mb-2">Pure Heritage</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-light">
              Strictly curation-led designs focusing on authentic textures, motifs, and weaving techniques of native communities.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg border border-cream-dark/20 shadow-sm text-center">
            <div className="w-12 h-12 bg-cream border border-gold/45 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-charcoal font-semibold text-base mb-2">Artisan Focus</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-light">
              Allocating fair wages and steady loom pipelines to keep traditional weaver families thriving.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
};

export default About;
