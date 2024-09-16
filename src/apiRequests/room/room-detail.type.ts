export interface RoomDetail {
  id: string;
  roomName: string;
  roomDescription: string;
  owner: {
    id: string;
    fullName: string;
    email: string;
  };
}
