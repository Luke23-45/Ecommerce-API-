export interface IProduct extends Document {
  name: string;
  userId:string;
  description?: string;
  price: number;
  category: string;
  inventory: number;
  image?: string; 
  userEmail?:string;
  createdBy?:"User"|"Admin";
  updatedBy?:"User"|"Admin";
  createdAt?: Date;
  updatedAt?: Date;
}

// remove User from createdBy?
// verify seller products by admin.
// add field in product -> sellerId and userId optional field. 
// category string[] 