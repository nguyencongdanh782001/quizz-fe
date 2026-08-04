"use client";

import { Plus } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ClassInfo } from "@/types/class.types";
import { CreateClassForm } from "../create/components/create-class-form";

interface CreateClassroomDialogProps {
  onCreated: (classroom: ClassInfo) => void;
  trigger?: ReactNode;
}

export function CreateClassroomDialog({
  onCreated,
  trigger,
}: CreateClassroomDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button type="button">
            <Plus className="size-4" />
            Tạo lớp mới
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="w-[min(100%-1rem,34rem)] gap-3 p-5 sm:p-5">
        <DialogHeader className="pr-8">
          <DialogTitle className="text-lg font-bold">Tạo lớp học mới</DialogTitle>
          <DialogDescription className="text-xs leading-5">
            Nhập thông tin cơ bản và mã để học sinh tham gia lớp.
          </DialogDescription>
        </DialogHeader>

        <CreateClassForm
          onCancel={() => setOpen(false)}
          onSuccess={(classroom) => {
            setOpen(false);
            onCreated(classroom);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
