import { Link } from "@remix-run/react";
import { GithubLogo } from "@phosphor-icons/react/dist/ssr/GithubLogo";
import { LinkedinLogo } from "@phosphor-icons/react/dist/ssr/LinkedinLogo";
import { XLogo } from "@phosphor-icons/react/dist/ssr/XLogo";

const socials = [
  {
    name: "Github",
    url: "https://github.com/nikolailehbrink",
    icon: GithubLogo,
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/nikolailehbrink/",
    icon: LinkedinLogo,
  },
  {
    name: "X",
    url: "https://twitter.com/nikolailehbrink",
    icon: XLogo,
  },
];

export default function Footer() {
  return (
    <footer className="bg-white/5 backdrop-blur-3xl sm:sticky sm:bottom-0">
      <section
        className="container flex items-center justify-between gap-4 py-4
          max-sm:flex-col"
      >
        <Link
          to={"/"}
          className="group flex items-center gap-2 tracking-tight
            text-neutral-800"
        >
          <img
            src="/logo.png"
            alt="Logo"
            className="w-8 transition-transform duration-500
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
            >
              Nikolai Lehbrink
            </Link>
          </p>
          <div className="relative">
            <div
              className="absolute -inset-[2px] rounded-lg bg-gradient-to-bl
                from-rose-500 via-sky-500 to-fuchsia-500 opacity-20"
            ></div>
            <div
              className="relative flex h-full items-center justify-center gap-2
                rounded-md bg-white/50 p-1 px-2 text-neutral-700
                backdrop-blur-2xl"
            >
              {socials.map(({ name, url, icon: Icon }) => (
                <Link
                  key={name}
                  to={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neutral-950"
                >
                  <Icon size={24} weight="duotone" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
}
