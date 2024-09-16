"use client";
import React, { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Star,
  Settings,
  CircleUserRound,
  Calendar,
  ChevronLeft,
  CircleChevronLeft,
} from "lucide-react";
import { useAppContext } from "@/app/providers/app-provider";
import { RoomDetail } from "@/apiRequests/room/room-detail.type";
import useAxiosPrivate from "@/app/common/util/axios/useAxiosPrivate";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Button,
  user,
  Textarea,
  Spinner,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import {
  ToastError,
  ToastSuccess,
  ToastWarning,
} from "@/app/common/util/toast";
import { TaskStatus } from "@/app/common/type/task-status.type";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: TaskStatus;
  review?: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
}

interface RoomDetailResponse {
  data: RoomDetail;
}

interface Member {
  isOwner: boolean;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
}

interface MemberListResponse {
  data: Member[];
}

const addTaskSchema = z.object({
  title: z.string().min(2).max(30),
  description: z.string().min(6).max(30),
  dueDate: z.string().refine((value) => {
    return new Date(value).getTime() > Date.now();
  }, "Due date must be in the future"),
  userId: z.string().optional(),
});

const today = new Date();

export default function RoomDetail() {
  const params = useParams<{ id: string }>();
  const { id } = params;
  const { user } = useAppContext();
  const [roomDetail, setRoomDetail] = useState<RoomDetail>();
  const [roomTaskList, setRoomTaskList] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
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
      title: "",
      description: "",
      dueDate: "",
      userId: "",
    },
  });

  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    console.log("Room ID:", id);

    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const roomData = await axiosPrivate.get<RoomDetailResponse>(
          "/room/" + id
        );
        // console.log("Room data:", roomData.data.data);

        setRoomDetail(roomData.data.data);
        // setRoomTaskList(tasksData);
        loadMembers();
        loadRoomTasks();
      } catch (err) {
        setError("Failed to fetch room data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      setMembers(res.data.data);
    } catch (err) {
      console.error(err);
      ToastError("Failed to load members");
    }
  };
  const loadRoomTasks = async (filterUserId?: string) => {
    try {
      const res = await axiosPrivate.get<{
        data: Task[];
      }>("/task/room/" + id, {
        params: {
          userId: filterUserId || "",
        },
      });
      // console.log(res.data);

      setRoomTaskList(res.data.data);
    } catch (err) {
      console.error(err);
      ToastError("Failed to load members");
    }
  };

  const editTask = (task) => {
    // Implement task editing logic
    // This might open a modal or navigate to an edit page
    console.log("Edit task:", task);
  };

  const updateStatus = async (e: any) => {
    try {
      e.preventDefault();
      const formData = new FormData(e.target);

      // Get form values
      const taskId = formData.get("taskId");
      const status = formData.get("status") as TaskStatus;
      if (!taskId || !status) {
        console.error("Invalid form data");
        return;
      }
      const isSameStatus = roomTaskList.find(
        (task) => task.id === taskId && task.status === status
      );
      if (isSameStatus) {
        ToastWarning("Task status is already " + status);
        return;
      }
      // api call to update task status
      await axiosPrivate.patch("/task/update-status", {
        taskId,
        status,
      });
      ToastSuccess("Task status updated to " + status);
      setRoomTaskList(
        roomTaskList.map((task) => {
          if (task.id === taskId) {
            return {
              ...task,
              status: status,
            };
          }
          return task;
        })
      );
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
  };

  async function onAddTask(values: z.infer<typeof addTaskSchema>) {
    try {
      console.log("Add task:", values);

      await axiosPrivate.post("/task", {
        title: values.title,
        description: values.description,
        dueDate: new Date(values.dueDate).toISOString(),
        userId: values.userId,
        roomId: id,
      });
      // fetchRooms();

      onCloseAddTask();
      addTaskForm.reset();
      await loadRoomTasks();
      ToastSuccess("Task added");
    } catch (error) {
      ToastError("Create room failed");
    }
  }

  if (loading) {
    return <Spinner />;
  }

  if (!roomDetail) {
    return (
      <div className="text-center">
        <h1 className="text-red-500 text-lg">Not found group</h1>
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
    <div className="min-h-screen">
      <div className="mb-4 flex justify-between border rounded-md p-4 shadow-sm">
        <div className="flex justify-start gap-2">
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/rooms"
                  passHref
                  className="h-full flex justify-center rounded-sm w-8 items-center bg-slate-100 hover:bg-slate-200 cursor-pointer"
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
            <span className="text-2xl font-bold ">
              Group {roomDetail.roomName}
            </span>
            <span>{roomDetail.roomDescription}</span>
            <div className="flex items-center gap-1 text-lg px-3 py-1 bg-slate-100 rounded-sm">
              <Star className="text-yellow-500" />
              {roomDetail.owner.fullName}
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-between">
          {roomDetail.owner.id === user?.sub && (
            <Button
              onPress={onOpenAddTask}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              Add Task
            </Button>
          )}

          <Modal isOpen={isOpenAddTask} onOpenChange={onOpenChangeAddTask}>
            <ModalContent>
              {(onClose) => (
                <Form {...addTaskForm}>
                  <form
                    onSubmit={addTaskForm.handleSubmit(onAddTask)}
                    className="space-y-6"
                  >
                    <ModalHeader className="flex flex-col gap-1">
                      Add new room
                    </ModalHeader>
                    <ModalBody>
                      <FormField
                        control={addTaskForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Task title" {...field} />
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
                              <Textarea
                                placeholder="Task description"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addTaskForm.control}
                        name="dueDate"
                        render={({ field }) => {
                          const tomorrow = new Date(today);
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          return (
                            <FormItem>
                              <FormLabel>Due date</FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  min={tomorrow.toISOString().split("T")[0]}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                      <FormField
                        control={addTaskForm.control}
                        name="userId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="mr-2">Assign to</FormLabel>
                            <FormControl className="border rounded-sm">
                              <select {...field}>
                                <option value="" selected>
                                  None
                                </option>
                                {members.map((member) => (
                                  <option
                                    key={member.user.id}
                                    value={member.user.id}
                                  >
                                    {member.user.fullName}
                                  </option>
                                ))}
                              </select>
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
                        onPress={onCloseAddTask}
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
          <Link href={`/rooms/${id}/members`} passHref>
            <Button className="bg-green-500 text-white hover:bg-green-600">
              Members
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-10 mb-3 text-center font-bold text-2xl">Tasks</div>

      {roomTaskList.length > 0 ? (
        <div className="flex flex-col gap-2">
          {roomTaskList.map((task, index) => (
            <div
              key={task.id}
              className="border rounded-md px-5 py-2 shadow flex justify-between relative"
            >
              <Settings
                className="text-lg cursor-pointer absolute top-0 left-1"
                onClick={() => editTask(task)}
              />
              <div className="flex items-center gap-5">
                <span className="text-lg font-bold w-7 h-7 flex items-center justify-center rounded-full bg-blue-300">
                  {index + 1}
                </span>
                <div className="flex flex-col">
                  <h1 className="text-xl">{task.title}</h1>
                  <p className="text-sm">{task.description}</p>
                  {task.user && (
                    <p className="flex items-center">
                      <CircleUserRound className="text-xl text-blue-500" />
                      <span>{task.user.fullName}</span>
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col justify-between items-end">
                <p className="flex items-center">
                  <Calendar className="text-xl text-blue-500" />
                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                </p>
                <div className="flex items-center gap-2">
                  {roomDetail.owner.id === user?.sub ||
                  task.user.id === user?.sub ? (
                    <form onSubmit={updateStatus} className="flex gap-2">
                      <input
                        type="hidden"
                        name="taskId"
                        value={task.id}
                        className=""
                      />
                      <select name="status" defaultValue={task.status}>
                        {Object.values(TaskStatus).map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <Button color="primary" size="sm" type="submit">
                        Update
                      </Button>
                    </form>
                  ) : (
                    <p className="border rounded-sm p-1 bg-slate-100 text-sm">
                      {task.status}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <h1 className="text-red-500 text-center text-lg">No tasks</h1>
      )}
    </div>
  );
}
