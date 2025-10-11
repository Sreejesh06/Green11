import { JSX } from "react";

type IconCreditsProps = {
	className?: string;
};

export function IconCredits({ className }: IconCreditsProps): JSX.Element {
	return (
		<div className={className}>
			<p className="text-xs text-muted-foreground">
				Icons made by{" "}
				<a href="https://www.freepik.com" className="underline" target="_blank" rel="noreferrer">
					Freepik
				</a>
				{" "}from{" "}
				<a href="https://www.flaticon.com/" className="underline" target="_blank" rel="noreferrer">
					Flaticon
				</a>
				.
			</p>
			<p className="text-xs text-muted-foreground">
				Icons made by{" "}
				<a
					href="https://www.flaticon.com/authors/prosymbols-premium"
					className="underline"
					target="_blank"
					rel="noreferrer"
				>
					Prosymbols Premium
				</a>
				{" "}from{" "}
				<a href="https://www.flaticon.com/" className="underline" target="_blank" rel="noreferrer">
					Flaticon
				</a>
				.
			</p>
			<p className="text-xs text-muted-foreground">
				Icons made by{" "}
				<a href="https://www.flaticon.com/authors/popcornarts" className="underline" target="_blank" rel="noreferrer">
					popcornarts
				</a>
				{" "}from{" "}
				<a href="https://www.flaticon.com/" className="underline" target="_blank" rel="noreferrer">
					Flaticon
				</a>
				.
			</p>
		</div>
	);
}
