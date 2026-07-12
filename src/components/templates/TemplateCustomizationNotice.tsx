import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";

const STORAGE_KEY = "templateCustomizationNoticeShown";

const TemplateCustomizationNotice = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!sessionStorage.getItem(STORAGE_KEY)) {
        setOpen(true);
        sessionStorage.setItem(STORAGE_KEY, "1");
      }
    } catch {
      setOpen(true);
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Palette className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center font-display text-2xl">
            These are just starting points
          </DialogTitle>
          <DialogDescription className="text-center text-base leading-relaxed">
            Every template is fully customized to match{" "}
            <span className="font-semibold text-foreground">your brand</span> —
            your colors, fonts, imagery and content. Pick one you like, and
            we'll tailor it to your business.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button onClick={() => setOpen(false)} className="min-w-32">
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateCustomizationNotice;
