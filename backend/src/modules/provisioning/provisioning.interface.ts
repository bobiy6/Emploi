export interface ProvisioningAdapter {
  create(config: any, server: any): Promise<string>;
  suspend(externalId: string, server: any): Promise<boolean>;
  unsuspend(externalId: string, server: any): Promise<boolean>;
  terminate(externalId: string, server: any): Promise<boolean>;
  powerAction(externalId: string, action: string, server: any): Promise<boolean>;
}
