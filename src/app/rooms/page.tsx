"use client";

import { useEffect, useState } from "react";
import useAxiosPrivate from "../common/util/axios/useAxiosPrivate";
import { useAppContext } from "../providers/app-provider";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ToastError } from "../common/util/toast";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Button,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";

export interface Room {
  id: string;
  name: string;
  description: string;
  isJoined: boolean;
}

const formSchema = z.object({
  name: z.string().min(2).max(30),
  description: z.string().min(6).max(30),
});

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const { user } = useAppContext();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const axiosPrivate = useAxiosPrivate();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    console.log(user);

    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    const response = await axiosPrivate.get("/room");
    console.log(response.data.data);

    setRooms(response.data.data);
  };

  async function onAddRoom(values: z.infer<typeof formSchema>) {
    try {
      await axiosPrivate.post("/room", values);
      fetchRooms();
      onClose();
    } catch (error) {
      ToastError("Create room failed");
    }
  }

  async function joinRoom(roomId: string) {
    try {
      await axiosPrivate.post(`/room/${roomId}/join`);
      router.push(`/rooms/${roomId}/tasks`);
    } catch (error) {
      ToastError("Join room failed");
    }
  }

  return (
    <div className="min-h-screen">
      <h1 className="text-2xl font-bold mb-4 flex justify-between items-center border rounded-md p-4 shadow-sm">
        <span>{user?.fullName}</span>
        <Button onPress={onOpen}>Add room</Button>
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onAddRoom)}
                  className="space-y-6"
                >
                  <ModalHeader className="flex flex-col gap-1">
                    Add new room
                  </ModalHeader>
                  <ModalBody>
                    <FormField
                      control={form.control}
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
                      control={form.control}
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
                    <Button color="danger" variant="light" onPress={onClose}>
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
      </h1>

      <div className="flex flex-col gap-2">
        {rooms?.map((room, index) => (
          <div
            key={index}
            className="border rounded-md px-5 py-2 shadow flex justify-between items-center"
          >
            <div>
              {room.isJoined ? (
                <Link
                  href={`/rooms/${room.id}/tasks`}
                  className="text-xl font-bold underline cursor-pointer"
                >
                  {room.name}
                </Link>
              ) : (
                <span className="text-xl font-bold">{room.name}</span>
              )}
              <p className="text-sm">{room.description}</p>
            </div>
            {!room.isJoined && (
              <button
                onClick={() => joinRoom(room.id)}
                className="text-sm px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded-sm"
              >
                Join room
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
