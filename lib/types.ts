export interface Settings {
  email: string;
  password: string;
  outputDir: string;
  showBrowser: boolean;
  forceRefresh: boolean;
  batchSize?: number;
}

interface TokenInfo {
  csrfToken: string;
  customerId: string;
}

interface BookResponse {
  OwnershipData: OwnershipData;
}

interface BookError {
  success: boolean;
  error: string;
}

interface OwnershipData {
  hasMoreItems: boolean;
  numberOfItems: number;
  success: boolean;
  items: BookItem[];
}

interface BookItem {
  readStatus: string;
  targetDevices: TargetDevices;
  bookProducerDetails: BookProducerDetail[];
  orderId: string;
  isNellOptimized: boolean;
  title: string;
  isGiftOption: boolean;
  sortableAuthors: string;
  isPurchased: boolean;
  excludedDeviceMap: Record<string, unknown>;
  getOrderDetails: boolean;
  expiredPublicLibraryLending: boolean;
  productImage: string;
  acquiredDate: string;
  isDeleteRestrictionEnabled: boolean;
  isGift: boolean;
  collectionList: string[];
  contentCategoryType: string;
  orderDetailURL: string;
  showProductDetails: boolean;
  isContentValid: boolean;
  canLoan: boolean;
  statusFromPlatformSearch: string;
  udlCategory: string;
  renderDownloadElements: boolean;
  acquiredTime: number;
  sortableTitle: string;
  refundEligibility: boolean;
  originType: string;
  capabilityList: string[];
  dpURL: string;
  collectionIds: string[];
  isInstitutionalRental: boolean;
  collectionCount: number;
  isAudibleOwned: boolean;
  asin: string;
  isKCRSupported: boolean;
  contentIdentifier: string;
  category: string;
  isPrimeShared: boolean;
  authors: string;
  readAlongSupport: string;
}

interface BookProducerDetail {
  role: string;
  name: string;
  asin: string;
}

interface TargetDevices {
  [key: string]: number;
}

interface VersionCapabilityMap {
  MOP_SUPPORTED: number;
  PDF_CONTENT_ENABLED: number;
  MAGZ_PURCHASE_ALLOWED: number;
  FREE_TRIAL_ALLOWED: number;
  PRIME_EBOOKS_COMPATIBLE: number;
  AUDIO_SUPPORTED: number;
  NWPR_PURCHASE_ALLOWED: number;
  ACTIVE_CONTENT_1: number;
  SUPPORTS_AUDIBLE_ITEM_DOWNLOAD_TITLE: number;
  WIFI_CAPABLE: number;
  EBOK_PURCHASE_ALLOWED: number;
  EMAIL_ALIAS_SUPPORTED: number;
  AUDIBLE_SUPPORTED: number;
}

interface DeviceCapabilities {
  [key: string]: string;
}

interface Device {
  // Required fields (present in all devices)
  deviceType: string;
  deviceAccountName: string;
  deviceAccountId: string;
  deviceFilter: string;
  deviceTypeString: string;
  deviceClassification: string;
  customerId: string;
  deviceGroupName: string;
  formattedLastRegisteredDate: string;
  lastRegisteredDate: string;

  // Optional fields (not present in all devices)
  deviceSerialNumber?: string;
  deviceImage?: string;
  deviceImageUrl?: string;
  softwareVersion?: string;
  deviceCapabilities?: DeviceCapabilities;
  softwareVersionDeviceCapabilities?: DeviceCapabilities;
  deviceClassificationString?: string;
  deviceTypeStringId?: string;
  firstRadioOnDate?: string;
  firstRadioOn?: number;
  deviceAlias?: string;
  doNotInheritParentName?: boolean;
  dtcpResult?: Record<string, unknown>;
  boundWarranty?: Record<string, unknown>;
  warranties?: Array<unknown>;
  parentAccountId?: string;
  parentDeviceType?: string;
}

interface DeviceListResponse {
  versionCapabilityMap: VersionCapabilityMap;
  isFreeTrialEnabled: boolean;
  devices: Device[];
  success: boolean;
  count: number;
}

interface DeviceResponse {
  GetDevices: DeviceListResponse;
}

export type {
  BookResponse,
  OwnershipData,
  Settings,
  Device,
  TokenInfo,
  BookItem,
  DeviceResponse,
  DeviceListResponse,
  VersionCapabilityMap,
  DeviceCapabilities,
};
