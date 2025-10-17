"use client";

import Image from "next/image";
import Link from "next/link";
import Logo from "@/public/window.svg";
import { ThemeToggle } from "@/components/ui/themeToggle";
import { authClient } from "@/lib/auth-client";
import { buttonVariants } from "@/components/ui/button";
import { UserDropdown } from "./UserDropdown";

const navigationItems = [
	{
		name: "Home",
		href: "/",
	},
	{
		name: "Courses",
		href: "courses",
	},
	{
		name: "Dashboard",
		href: "/dashboard",
	},
];

export function Navbar() {
	const { data: session, isPending } = authClient.useSession();
	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur=[backdrop-filter]:bg-background/60">
			<div className="container flex items-center px-4 mx-auto min-h-16 md:px-6 lg:px-8">
				<Link href="/" className="flex items-center mr-4 space-x-2">
					<Image src={Logo} alt="Logo" className="size-9" />
					<span className="font-bold">gapiLMS.</span>
				</Link>

				<nav className="items-center hidden md:flex md:flex-1 md: md:justify-between">
					<div className="flex items-center space-x-2">
						{navigationItems.map((item) => (
							<Link
								key={item.name}
								href={item.href}
								className="text-sm font-medium transitions-colors hover:text-primary"
							>
								{item.name}
							</Link>
						))}
					</div>
					<div className="flex items-center space-x-4">
						<ThemeToggle />

						{isPending ? null : session ? (
							<UserDropdown
								name={session.user.name}
								email={session.user.email}
								image={session.user.image || ""}
							/>
						) : (
							<>
								<Link
									href="/login"
									className={buttonVariants({
										variant: "secondary",
									})}
								>
									Login
								</Link>
								<Link href="/login" className={buttonVariants()}>
									Get Started
								</Link>
							</>
						)}
					</div>
				</nav>
			</div>
		</header>
	);
}
