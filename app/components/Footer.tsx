import { Link } from "react-router";
import GradientContainer from "./GradientContainer";
import { SOCIALS } from "@/constants/socials";

export default function Footer() {
  return (
    <footer className="bg-white/5 backdrop-blur-3xl sm:sticky sm:bottom-0">
      <section
        className="container flex items-center justify-between gap-4 py-4
          max-sm:flex-col"
      >
        <Link
          to={"/"}
          prefetch="viewport"
          className="group flex items-center gap-2 tracking-tight
            text-neutral-800"
          aria-label="Go to homepage"
        >
          <img
            width={32}
            height={32}
            src="/logo.webp"
            alt="Logo"
            className="size-8 transition-transform duration-500
              group-hover:scale-110"
          />
          <div className="gap -mt-[2px] flex flex-col -space-y-1">
            <p className="font-semibold tracking-tighter">secretmessag.es</p>
            <p className="text-sm text-neutral-600">
              Share confidential messages
            </p>
          </div>
        </Link>
        <div
          className="flex flex-wrap items-center justify-center gap-4 text-sm
            text-muted-foreground sm:gap-2"
        >
          <p>
            Made by{" "}
            <Link
              to="http://www.nikolailehbr.ink"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-950 hover:underline
                hover:underline-offset-2"
              aria-label="Go to Nikolai Lehbrink's website"
            >
              Nikolai Lehbrink
            </Link>
          </p>
          <GradientContainer>
            <div
              className="relative flex h-full items-center justify-center gap-2
                rounded-md bg-white/50 p-1 px-2 text-neutral-700
                backdrop-blur-2xl"
            >
              {SOCIALS.map(({ name, url, icon: Icon }) => (
                <Link
                  key={name}
                  to={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neutral-950"
                  aria-label={`Go to ${name} account of Nikolai Lehbrink`}
                >
                  <Icon size={24} weight="duotone" />
                </Link>
              ))}
            </div>
          </GradientContainer>
        </div>
      </section>
    </footer>
  );
}
