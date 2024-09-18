"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Dialog } from "@/components/ui/dialog";

import { ToastError, ToastSuccess } from "@/app/common/util/toast";
import { useAppContext } from "@/app/providers/app-provider";
import { RoomDetail } from "@/apiRequests/room/room-detail.type";
import useAxiosPrivate from "@/app/common/util/axios/useAxiosPrivate";
import {
  ChevronLeft,
  CircleChevronLeft,
  Copy,
  Crown,
  RefreshCcw,
  Star,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Button,
  Spinner,
  PopoverTrigger,
  Popover,
  PopoverContent,
} from "@nextui-org/react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Style } from "@/app/common/util/style";

interface MemberListResponse {
  data: Member[];
}

interface Member {
  isOwner: boolean;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
}

interface RoomDetailResponse {
  data: RoomDetail;
}

const addMemberSchema = z.object({
  email: z.string().email().min(6).max(30),
});

export default function RoomMemberPage() {
  const params = useParams<{ id: string }>();
  const { id } = params;
  const router = useRouter();
  const [roomDetail, setRoomDetail] = useState<RoomDetail>();
  const { user } = useAppContext();
  const [members, setMembers] = useState<Member[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const axiosPrivate = useAxiosPrivate();
  const [loadingRoom, setLoadingRoom] = useState(true);
  const {
    isOpen: isOpenAddMember,
    onOpen: onOpenAddMember,
    onOpenChange: onOpenChangeAddMember,
    onClose: onCloseAddMember,
  } = useDisclosure();
  const addMemberForm = useForm<z.infer<typeof addMemberSchema>>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      email: "",
    },
  });
  const [isPopoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    console.log(user);

    if (id) {
      loadMembers();
      loadRoom();
    }
  }, [id, user]);

  const loadMembers = async () => {
    try {
      const res = await axiosPrivate.get<MemberListResponse>(
        "/room/" + id + "/users",
        {
          params: {
            includeOwner: true,
          },
        }
      );
      console.log(res.data);

      setMembers(res.data.data);
    } catch (err) {
      console.error(err);
      ToastError("Failed to load members");
    }
  };

  const loadRoom = async () => {
    try {
      setLoadingRoom(true);
      const roomData = await axiosPrivate.get<RoomDetailResponse>(
        "/room/" + id
      );
      const detail = roomData.data.data;
      setRoomDetail(detail);
      console.log({
        user,
        owner: detail.owner.id,
      });

      setIsOwner(user?.sub === detail.owner.id);
    } catch (err: any) {
      console.error(err);
      ToastError(err?.response?.data?.message || "Failed to load room");
      router.push("/rooms");
    }
    setLoadingRoom(false);
  };

  async function onAddMember(values: z.infer<typeof addMemberSchema>) {
    try {
      console.log(values);
      if (members.find((member) => member.user.email === values.email)) {
        ToastError("Member already joined");
        return;
      }

      await axiosPrivate.post(`/room/${id}/add-member`, {
        email: values.email,
      });
      // fetchRooms();
      ToastSuccess("Member added successfully");
      await loadMembers();
      onCloseAddMember();
    } catch (error: any) {
      ToastError(error.response?.data?.message || "Failed to add member");
    }
  }

  const handleRemoveMember = async (member: Member) => {
    if (!member) return;

    try {
      await axiosPrivate.delete(`/room/${id}/remove-member`, {
        data: {
          userId: member.user.id,
          removeAll: false,
        },
      });

      setPopoverOpen(false);
      ToastSuccess("Member removed successfully");
      loadMembers();
    } catch (err) {
      console.error(err);
      ToastError("Failed to remove member");
    }
  };

  const handleCopyInviteCode = async () => {
    if (!roomDetail?.inviteLink) {
      console.error("Invite code not found");
      return;
    }
    try {
      await navigator.clipboard.writeText(roomDetail?.inviteLink);
      ToastSuccess("Invite code copied");
    } catch (err) {
      console.error(err);
      ToastError("Failed to copy invite code");
    }
  };

  if (loadingRoom) {
    return <Spinner />;
  }

  if (!roomDetail) {
    return (
      <div className="text-center">
        <h1 className="text-red-500 text-lg">Group not found</h1>
        <Link
          href="/home"
          className="text-blue-500 hover:underline cursor-pointer block"
        >
          Home
        </Link>
      </div>
    );
  }

  return (
    <div className="">
      <div className="mb-4 flex justify-between gap-4 border rounded-md p-4 shadow-sm">
        <div className="flex gap-2 justify-start">
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/rooms"
                  passHref
                  className="h-full flex justify-center rounded-sm w-8 items-center bg-slate-100 hover:bg-slate-200"
                >
                  <ChevronLeft size={25} />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Back to rooms</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex flex-col gap-2">
            <span className="text-2xl font-bold">
              Group {roomDetail.roomName}
            </span>
            <span>{roomDetail.roomDescription}</span>
            <div className="flex items-center gap-1 text-lg px-3 py-1 bg-slate-100 rounded-sm">
              <Crown size={20} color={Style.CROWN} />
              {roomDetail.owner.fullName}
            </div>
            <p className="flex items-center text-sm gap-2">
              <span>Copy invite code</span>
              <span
                className="hover:opacity-50 hover:cursor-pointer"
                onClick={handleCopyInviteCode}
              >
                <Copy size={20} />
              </span>
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-between">
          {isOwner && (
            <Button
              onPress={onOpenAddMember}
              className="bg-green-400 text-white hover:bg-green-600"
            >
              Add Member
            </Button>
          )}
          <Modal
            isOpen={isOpenAddMember}
            onOpenChange={onOpenAddMember}
            placement="center"
          >
            <ModalContent>
              {(onClose) => (
                <Form {...addMemberForm}>
                  <form
                    onSubmit={addMemberForm.handleSubmit(onAddMember)}
                    className="space-y-6"
                  >
                    <ModalHeader className="flex flex-col gap-1">
                      Add member
                    </ModalHeader>
                    <ModalBody>
                      <FormField
                        control={addMemberForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Input email..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </ModalBody>
                    <ModalFooter>
                      <Button
                        color="danger"
                        variant="light"
                        onPress={onCloseAddMember}
                      >
                        Close
                      </Button>
                      <Button color="primary" type="submit">
                        Add
                      </Button>
                    </ModalFooter>
                  </form>
                </Form>
              )}
            </ModalContent>
          </Modal>
          <Link href={`/rooms/${id}/tasks`} passHref>
            <Button
              variant="bordered"
              className="border-2 border-blue-400 text-blue-400 bg-white hover:border-blue-600 w-full"
            >
              Tasks
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-10 mb-3 text-center font-bold text-2xl relative">
        Members
        <span
          className="absolute right-0 cursor-pointer hover:opacity-60"
          onClick={() => loadMembers()}
        >
          <RefreshCcw />
        </span>
      </div>

      {members.length > 0 ? (
        <div className="flex flex-col gap-2">
          {members.map((member, index) => (
            <div
              key={member.user.id}
              className="border rounded-md px-5 py-2 shadow flex justify-between items-center"
            >
              <div className="flex items-center gap-5">
                <span className="text-lg font-bold w-7 h-7 flex items-center justify-center rounded-full bg-blue-300">
                  {index + 1}
                </span>
                <div className="flex flex-col">
                  <h1 className="text-xl flex gap-2 items-center">
                    {member.user.fullName}{" "}
                    {member.isOwner && (
                      <Star size={20} color="#eab308" fill="#eab308" />
                    )}
                  </h1>
                  <p className="text-sm">{member.user.email}</p>
                </div>
              </div>
              {roomDetail.owner.id === user?.sub && !member.isOwner && (
                <Popover
                  isOpen={isPopoverOpen}
                  onOpenChange={setPopoverOpen}
                  placement="right"
                >
                  <PopoverTrigger>
                    <Button size="sm" color="danger">
                      Remove
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <div className="px-1 py-2">
                      <div className="text-small font-bold">
                        Are you sure to remove member "{member?.user?.fullName}
                        "?
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleRemoveMember(member)}
                          className="px-3 py-1 bg-red-400 rounded-sm text-sm"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setPopoverOpen(false)}
                          className="px-3 py-1 bg-gray-200 rounded-sm text-sm"
                        >
                          No
                        </button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          ))}
        </div>
      ) : (
        <h1 className="text-red-500 text-center text-lg">No members</h1>
      )}

      {/* <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        roomId={roomId}
        onMemberAdded={loadMembers}
      />

      <ConfirmRemoveModal
        isOpen={isConfirmRemoveModalOpen}
        onClose={() => setIsConfirmRemoveModalOpen(false)}
        memberName={memberToRemove?.name}
        onConfirm={handleRemoveMember}
      /> */}
    </div>
  );
}
