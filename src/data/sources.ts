/**
 * Connected sources mock data (PRD §5.3).
 */

export type SourceStatus = "connected" | "not_connected";

export interface Source {
  id: string;
  name: string;
  logo: string;
  status: SourceStatus;
}

export const SOURCES: Source[] = [
  {
    id: "slack",
    name: "Slack",
    logo: "https://cdn.simpleicons.org/slack",
    status: "connected",
  },
  {
    id: "gmail",
    name: "Gmail",
    logo: "https://cdn.simpleicons.org/gmail",
    status: "connected",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    logo: "https://cdn.simpleicons.org/whatsapp",
    status: "connected",
  },
  {
    id: "notion",
    name: "Notion",
    logo: "https://cdn.simpleicons.org/notion",
    status: "connected",
  },
  {
    id: "gdrive",
    name: "Google Drive",
    logo: "https://cdn.simpleicons.org/googledrive",
    status: "connected",
  },
  {
    id: "teams",
    name: "Microsoft Teams",
    logo: "https://cdn.simpleicons.org/microsoftteams",
    status: "not_connected",
  },
];
