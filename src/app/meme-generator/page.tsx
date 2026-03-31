import { AdvancedMemeGenerator } from '@/components/meme/AdvancedMemeGenerator';

export default function AdvancedMemeGeneratorPage() {
  return (
    <main className="bg-[#f7f4ee] dark:bg-gray-950 min-h-screen py-8">
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-900 border-2 border-zinc-700 dark:border-zinc-400 shadow-[10px_10px_0px_rgba(0,0,0,0.9)] dark:shadow-[10px_10px_0px_rgba(156,163,175,0.42)] p-2 md:p-4">
          <AdvancedMemeGenerator />
        </div>
      </section>
    </main>
  );
}



