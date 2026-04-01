export interface ProvisioningAdapter {
  create(config: any): Promise<string>;
  suspend(externalId: string): Promise<boolean>;
  terminate(externalId: string): Promise<boolean>;
  powerAction(externalId: string, action: string): Promise<boolean>;
}
