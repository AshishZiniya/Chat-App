export type User = {
  _id: string;
  username: string;
  avatar?: string;
  online?: boolean;
};

export type Message = {
  _id: string;
  from: string;
  to: string;
  text: string;
  createdAt: string | number | Date;
  username?: string;
  avatar?: string;
  deletedBy?: string[];
};

export type TypingPayload = {
  from: string;
  username: string;
};
