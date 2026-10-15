export const organizationPhotoKey = (employee: { id: string; photo_path: string }) => `${employee.id}:${employee.photo_path}`;
export const organizationPhotoVersion = (path: string) => `avatar-384-v1:${path}`;

// Scoped to one authenticated provider. Failed reads are never cached.
export class OrganizationPhotoCache {
  private entries = new Map<string, Promise<string>>();
  private urls = new Set<string>();
  private generation = 0;

  load(key: string, fetchPhoto: () => Promise<Blob | null>): Promise<string> {
    const existing = this.entries.get(key);
    if (existing) return existing;
    const generation = this.generation;
    const pending: Promise<string> = Promise.resolve().then(fetchPhoto).then(async blob => {
      if (generation !== this.generation) return '';
      // A confirmed save may have supplied a preview while this request ran.
      if (this.entries.get(key) !== pending) return this.entries.get(key) || '';
      if (!blob) return '';
      return this.createUrl(blob);
    }).catch(() => '').then(url => {
      if (!url && this.entries.get(key) === pending) this.entries.delete(key);
      return url;
    });
    this.entries.set(key, pending);
    return pending;
  }

  prime(key: string, blob: Blob) {
    this.entries.set(key, Promise.resolve(this.createUrl(blob)));
  }

  private createUrl(blob: Blob) {
    const url = URL.createObjectURL(blob);
    this.urls.add(url);
    return url;
  }

  dispose() {
    this.generation++;
    this.entries.clear();
    this.urls.forEach(url => URL.revokeObjectURL(url));
    this.urls.clear();
  }
}
