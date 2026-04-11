import { AdvancedMemeGenerator } from '@/components/meme/AdvancedMemeGenerator';

export default function AdvancedMemeGeneratorPage() {
  return (
    <main className="bg-[#f7f4ee] dark:bg-gray-950 py-2 md:py-4">
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-0">
          <AdvancedMemeGenerator />
        </div>
      </section>
    </main>
  );
}



