import type { ReactNode } from 'react';

export type CrudEntity<T> = T & { id: string };

export type CrudActions<T> = {
  list: () => Promise<T[]>;
  get?: (id: string) => Promise<T>;
  create?: (data: Partial<T>) => Promise<T>;
  update?: (id: string, data: Partial<T>) => Promise<T>;
  remove?: (id: string) => Promise<void>;
};

export type CrudFilter<T> = {
  field: keyof T;
  value: string | number;
};

export type CrudPageProps<T> = {
  items: T[];
  columns: Array<{ key: keyof T; title: string; render?: (item: T) => ReactNode }>;
  onCreate?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
};
