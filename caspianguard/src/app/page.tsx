import { Header } from "@/components/Header";
import { Hero, Marquee } from "@/components/sections/Hero";
import { Problem, Solution } from "@/components/sections/Story";
import { Explore } from "@/components/sections/Explore";
import { Final, Future, Process, Team, Values } from "@/components/sections/Journey";
import { SceneRoot } from "@/scene/SceneRoot";
import { ScrollDirector } from "@/scene/ScrollDirector";

export default function Home() {
  return (
    <>
      <SceneRoot />
      <ScrollDirector />
      <Header />
      <main id="main" className="relative z-10">
        <Hero />
        <Marquee />
        <Problem />
        <Solution />
        <Explore />
        <Process />
        <Future />
        <Values />
        <Team />
      </main>
      <div className="relative z-10">
        <Final />
      </div>
    </>
  );
}
