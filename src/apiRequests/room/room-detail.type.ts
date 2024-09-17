export interface RoomDetail {
  id: string;
  roomName: string;
  roomDescription: string;
  inviteLink: string;
  owner: {
    id: string;
    fullName: string;
    email: string;
  };
}
