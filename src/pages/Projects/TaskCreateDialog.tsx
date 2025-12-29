import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Stack,
} from "@mui/material";
import { useState } from "react";
import Button from "../../shared/Button/Button";

interface TaskCreateDialogProps {
    open: boolean;
    onClose: () => void;
    // onCreate: (data: { name: string; description: string }) => void;
    onCreate: (name: string) => void;
}

export default function TaskCreateDialog({
    open,
    onClose,
    onCreate,
}: TaskCreateDialogProps) {
    const [name, setName] = useState("");
    // const [description, setDescription] = useState("");

    const handleSubmit = () => {
        onCreate(name);
        setName("");
        // onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth >
            <DialogTitle>Create Task</DialogTitle>

            <DialogContent sx={{ height: "20vh" }}>
                <Stack spacing={2} mt={1}>
                    <TextField
                        label="Task Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth
                        required
                    />

                    {/* <TextField
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                    /> */}
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={!name.trim()}
                >
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    );
}
