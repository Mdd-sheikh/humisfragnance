// Helpers shared by the blog list and blog detail pages.
// Converts a post document from the backend into the shape the UI renders.

const formatDate = (value) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

const timeAgo = (value) => {
    const then = new Date(value).getTime();
    if (Number.isNaN(then)) return "";
    const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));
    const units = [
        ["year", 31536000],
        ["month", 2592000],
        ["week", 604800],
        ["day", 86400],
        ["hour", 3600],
        ["minute", 60],
    ];
    for (const [name, size] of units) {
        const n = Math.floor(seconds / size);
        if (n >= 1) return `${n} ${name}${n > 1 ? "s" : ""} ago`;
    }
    return "Just now";
};

export const mapPost = (post) => {
    const images = post.images ?? [];
    return {
        id: post._id,
        slug: post.slug,
        title: post.title,
        category: post.category,
        date: formatDate(post.date),
        timeAgo: timeAgo(post.date),
        excerpt: post.excerpt,
        bannerText: post.bannerText,
        image: images[0]?.imageUrl ?? "",
        imageAlt: images[0]?.alt ?? post.title,
        extraImages: images.slice(1).map((img) => ({ url: img.imageUrl, alt: img.alt })),
        featured: !!post.featured,
        topStory: !!post.topStory,
        author: post.author,
        metaTitle: post.metaTitle,
        metaDescription: post.metaDescription,
        // content is one plain-text string; blank lines separate paragraphs
        paragraphs: (post.content ?? "")
            .split(/\n\s*\n/)
            .map((p) => p.trim())
            .filter(Boolean),
    };
};
