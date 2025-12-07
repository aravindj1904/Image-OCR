export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export enum AppMode {
  CSV_EXTRACTOR = 'CSV_EXTRACTOR',
  IMAGE_EDITOR = 'IMAGE_EDITOR',
}

export interface GeneratedImage {
  mimeType: string;
  data: string; // Base64 string
}
