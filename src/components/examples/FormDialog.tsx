import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export const FormDialog = () => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      toast({
        title: "Success",
        description: `You entered: ${inputValue}`,
      });
      setInputValue("");
      setOpen(false);
    } else {
      toast({
        title: "Error",
        description: "Please enter a value",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Open Form Dialog</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Example Form</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Enter something
            </label>
            <Input
              id="name"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type here..."
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};