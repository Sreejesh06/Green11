type AvatarIcon = {
	src: string;
	alt: string;
};

const avatarIconMap: Record<string, AvatarIcon> = {
	PS: {
		src: "https://cdn-icons-png.flaticon.com/512/9131/9131529.png",
		alt: "Green leaf character icon by Freepik",
	},
	RM: {
		src: "https://cdn-icons-png.flaticon.com/512/2922/2922561.png",
		alt: "Smiling eco avatar icon by Prosymbols Premium",
	},
	AK: {
		src: "https://cdn-icons-png.flaticon.com/512/4140/4140042.png",
		alt: "Nature themed avatar icon by popcornarts",
	},
	SP: {
		src: "https://cdn-icons-png.flaticon.com/512/9131/9131536.png",
		alt: "Eco volunteer icon by Freepik",
	},
	VS: {
		src: "https://cdn-icons-png.flaticon.com/512/2922/2922510.png",
		alt: "Community hero icon by Prosymbols Premium",
	},
	AR: {
		src: "https://cdn-icons-png.flaticon.com/512/4140/4140037.png",
		alt: "Green advocate icon by popcornarts",
	},
	KR: {
		src: "https://cdn-icons-png.flaticon.com/512/9131/9131547.png",
		alt: "Recycling supporter icon by Freepik",
	},
	DN: {
		src: "https://cdn-icons-png.flaticon.com/512/2922/2922656.png",
		alt: "Sustainability student icon by Prosymbols Premium",
	},
};

export function getAvatarIcon(initials: string | undefined | null): AvatarIcon | undefined {
	if (!initials) {
		return undefined;
	}

	return avatarIconMap[initials.toUpperCase()];
}
