declare interface IControlStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DescriptionFieldLabel: string;
}

declare module 'ControlStrings' {
  const strings: IControlStrings;
  export = strings;
}
