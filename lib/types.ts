import { Buyer, User, BuyerHistory } from '@prisma/client';

export type BuyerWithOwner = Buyer & {
  owner: User;
};

export type BuyerWithHistory = Buyer & {
  owner: User;
  histories: (BuyerHistory & {
    user: User;
  })[];
};

export type DiffEntry = {
  field: string;
  old: any;
  new: any;
};

export type CSVImportResult = {
  success: boolean;
  totalRows: number;
  successCount: number;
  failedRows: {
    row: number;
    error: string;
    data: any;
  }[];
};