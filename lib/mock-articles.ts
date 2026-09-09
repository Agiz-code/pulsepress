import type { DetailArticle, RelatedStory, SourceEntry } from "./types";

const sourceList: SourceEntry[] = [
  { name: "Fox News", bias: "right" },
  { name: "The Wall Street Journal", bias: "center" },
  { name: "Reuters", bias: "center" },
  { name: "BBC News", bias: "center" },
  { name: "CNN", bias: "left" },
  { name: "The New York Times", bias: "center" },
  { name: "The Washington Post", bias: "center" },
  { name: "Newsmax", bias: "right" },
];

const relatedStories: RelatedStory[] = [
  {
    id: "iran-says-it-will-not-negotiate",
    category: "World",
    location: "Middle East",
    title: "Iran Says It Will Not Negotiate Under ‘Maximum Pressure’",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=640&q=80",
    publishedDate: "May 29, 2026",
    readTime: "8 min read",
  },
  {
    id: "bipartisan-group-urges-diplomacy",
    category: "Politics",
    location: "United States",
    title: "Bipartisan Group Urges Diplomacy With Iran",
    imageUrl: "https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=640&q=80",
    publishedDate: "May 28, 2026",
    readTime: "5 min read",
  },
  {
    id: "us-sanctions-more-iranian-entities",
    category: "Politics",
    location: "United States",
    title: "US Sanctions More Iranian Entities Over Nuclear Program",
    imageUrl: "https://images.unsplash.com/photo-1528150177507-5f3be7ed9b9d?auto=format&fit=crop&w=640&q=80",
    publishedDate: "May 28, 2026",
    readTime: "6 min read",
  },
  {
    id: "what-is-the-2015-iran-nuclear-deal",
    category: "Science",
    location: "Nuclear Policy",
    title: "What’s in the 2015 Iran Nuclear Deal?",
    imageUrl: "https://images.unsplash.com/photo-1557682260-967f019f3f8f?auto=format&fit=crop&w=640&q=80",
    publishedDate: "May 25, 2026",
    readTime: "10 min read",
  },
  {
    id: "israel-reaffirms-red-line",
    category: "World",
    location: "Middle East",
    title: "Israel Reaffirms Red Line Over Iranian Nuclear Program",
    imageUrl: "https://images.unsplash.com/photo-1515442261605-659877b3f1ae?auto=format&fit=crop&w=640&q=80",
    publishedDate: "May 24, 2026",
    readTime: "6 min read",
  },
];

export const MOCK_DETAIL_ARTICLES: Record<string, DetailArticle> = {
  "trump-iran-peace-proposal": {
    id: "trump-iran-peace-proposal",
    category: "Politics",
    location: "United States",
    title: "Trump Sends Iran Revised Peace Proposal With Tougher Terms: Report",
    author: "By David Morgan",
    publishedDate: "May 31, 2026",
    readTime: "12 min read",
    imageUrl: "https://picsum.photos/seed/trump-iran/1200/700",
    imageCaption:
      "President Donald Trump in the Cabinet Room at the White House, Washington, D.C., May 30, 2026. Photo: Andrew Harnik/Getty Images",
    bias: { left: 20, center: 31, right: 49 },
    sources: 12,
    body: [
      "The Trump administration has sent Iran a revised nuclear deal proposal that includes tougher terms on uranium enrichment and stronger verification measures, according to a report published Saturday.",
      "The new proposal, delivered through intermediaries in Oman, requires Iran to halt all uranium enrichment on its soil and ship its stockpile of enriched uranium out of the country. It also demands unrestricted access for international inspectors to all Iranian nuclear facilities, including military sites.",
      "“This is a take-it-or-leave-it proposal,” a senior administration official told the Wall Street Journal. “The President wants a deal, but he will not accept a weak agreement that puts America or our allies at risk.”",
      "Iran has not yet officially responded to the proposal. However, Iranian Foreign Minister Hossein Amir-Abdollahian said last week that any deal must respect Iran’s right to peaceful nuclear energy and include the lifting of all U.S. sanctions.",
      "The revised proposal comes after several rounds of indirect talks between U.S. and Iranian officials failed to produce a breakthrough. The Trump administration has warned that if diplomacy fails, it is prepared to take other action to prevent Iran from obtaining a nuclear weapon.",
      "European allies have urged both sides to continue negotiations. “We believe diplomacy is still the best path forward,” said a spokesperson for the EU’s foreign policy chief.",
      "Israel, which has long opposed the 2015 nuclear deal with Iran, praised the Trump administration’s tougher stance. “This is the kind of leadership that was missing in the past,” said Israeli Prime Minister Benjamin Netanyahu in a statement.",
      "The fate of the proposal now rests with Iran, as global attention remains focused on whether a new nuclear agreement can be reached—or if tensions will escalate further.",
    ],
    overallBiasLabel: "right",
    overallBiasPercent: 49,
    summary: [
      "The Trump administration has sent Iran a revised nuclear deal proposal with tougher terms, including a complete halt to uranium enrichment and the removal of enriched uranium stockpiles.",
      "The proposal also demands unrestricted inspector access to all nuclear sites, including military facilities.",
      "Iran has not responded officially but says any deal must respect its right to peaceful nuclear energy and include sanctions relief.",
      "The U.S. warns it is prepared to take other action if diplomacy fails, while European allies urge continued negotiations.",
      "Israel supports the tougher stance, praising the administration’s determination to prevent Iran from obtaining a nuclear weapon.",
    ],
    summaryDate: "May 31, 2026",
    summaryReadTime: "3 min read",
    sourceList,
    relatedIds: relatedStories.map((story) => story.id),
  },
};

export function getMockDetailArticle(id: string): DetailArticle | undefined {
  return MOCK_DETAIL_ARTICLES[id];
}

export function getMockRelatedStories(ids: string[]): RelatedStory[] {
  return relatedStories.filter((story) => ids.includes(story.id));
}

export function getMockRelatedStoriesForPage(id: string): RelatedStory[] {
  if (id === "trump-iran-peace-proposal") {
    return relatedStories.slice(0, 4);
  }
  return [];
}
