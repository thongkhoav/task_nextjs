"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Dialog } from "@/components/ui/dialog";

import { ToastError } from "@/app/common/util/toast";
import { useAppContext } from "@/app/providers/app-provider";
import { RoomDetail } from "@/apiRequests/room/room-detail.type";
import useAxiosPrivate from "@/app/common/util/axios/useAxiosPrivate";
import { ChevronLeft, CircleChevronLeft, Star } from "lucide-react";
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

const addTaskSchema = z.object({
  name: z.string().min(2).max(30),
  description: z.string().min(6).max(30),
});

const RoomMember = () => {
  const params = useParams<{ id: string }>();
  const { id } = params;

  const [roomDetail, setRoomDetail] = useState<RoomDetail>();
  const { user } = useAppContext();
  const [members, setMembers] = useState<Member[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isConfirmRemoveModalOpen, setIsConfirmRemoveModalOpen] =
    useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const axiosPrivate = useAxiosPrivate();
  const {
    isOpen: isOpenAddTask,
    onOpen: onOpenAddTask,
    onOpenChange: onOpenChangeAddTask,
    onClose: onCloseAddTask,
  } = useDisclosure();
  const addTaskForm = useForm<z.infer<typeof addTaskSchema>>({
    resolver: zodResolver(addTaskSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (id) {
      loadMembers();
      loadRoom();
    }
  }, [id]);

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
      const roomData = await axiosPrivate.get<RoomDetailResponse>(
        "/room/" + id
      );
      const detail = roomData.data.data;
      setRoomDetail(detail);
      setIsOwner(user?.sub === detail.owner.id);
    } catch (err) {
      console.error(err);
      ToastError("Failed to load room detail");
    }
  };

  const addMember = () => {
    setIsAddMemberModalOpen(true);
  };

  const removeMember = (member) => {
    setMemberToRemove(member);
    setIsConfirmRemoveModalOpen(true);
  };

  const handleRemoveMember = async () => {
    if (!id || !memberToRemove) return;

    // try {
    //   await removeRoomMember(id, memberToRemove.id);
    //   toast.success("Member removed successfully");
    //   loadMembers();
    // } catch (err) {
    //   console.error(err);
    //   toast.error("Failed to remove member");
    // }

    setIsConfirmRemoveModalOpen(false);
    setMemberToRemove(null);
  };

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
    <div className="mt-10 flex justify-center">
      <div className="container ">
        <div className="mb-4 flex justify-between gap-4 border rounded-md p-4 shadow-sm">
          <div className="flex gap-2 justify-start">
            <TooltipProvider delayDuration={300}>
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

            <div className="flex flex-col">
              <span className="text-2xl font-bold">
                Group {roomDetail.roomName}
              </span>
              <span>{roomDetail.roomDescription}</span>
              <div className="flex items-center gap-1 text-lg px-3 py-1 bg-slate-100 rounded-sm">
                <Star size={20} color="#eab308" fill="#eab308" />
                {roomDetail.owner.fullName}
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between">
            {isOwner && (
              <Button
                onClick={addMember}
                className="bg-green-400 text-white hover:bg-green-600"
              >
                Add Member
              </Button>
            )}
            <Modal isOpen={isOpenAddTask} onOpenChange={onOpenChangeAddTask}>
              <ModalContent>
                {(onClose) => (
                  <Form {...addTaskForm}>
                    <form
                      onSubmit={addTaskForm.handleSubmit(onAddRoom)}
                      className="space-y-6"
                    >
                      <ModalHeader className="flex flex-col gap-1">
                        Add new room
                      </ModalHeader>
                      <ModalBody>
                        <FormField
                          control={addTaskForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input
                                  type="Room name"
                                  placeholder="Input room name..."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={addTaskForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Input
                                  type="Room description"
                                  placeholder="Input room description..."
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
                          onPress={onClose}
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
              <Button className="bg-blue-400 text-white hover:bg-blue-600 w-full">
                Tasks
              </Button>
            </Link>
          </div>
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
                  <Button onClick={() => removeMember(member)} color="danger">
                    Remove
                  </Button>
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
    </div>
  );
};

export default RoomMember;
