// In components/ILeaveMasterProps.ts
import { WebPartContext } from "@microsoft/sp-webpart-base";
export interface ILeaveMasterProps {
  description: string;
  listName: string;
  context: WebPartContext;
  isDarkTheme: boolean;
  userDisplayName: string;
}
