
import styles from "./ConfirmApproveDialog.module.css";

function Modal({ open, children }: { open: boolean; children: React.ReactNode }) {
	if (!open) return null;
	return (
		<div className={styles.modalOverlay}>
			<div className={styles.modal} role="dialog" aria-modal="true">
				{children}
			</div>
		</div>
	);
}


export function ApproveConfirmModal({
	open,
	title,
	confirmLabel = "Approve",
	onConfirm,
	onCancel,
}: {
	open: boolean;
	title: string;
	message: string;
	confirmLabel?: string;
	onConfirm: () => void;
	onCancel: () => void;
}) {
	return (
		<Modal open={open}>
			<div className={styles.modalContainer}>
				<h3 className={styles.modalTitle}>{title}</h3>

				<div className={styles.modalActions}>
					<button className={styles.secondary} onClick={onCancel} type="button">
						Cancel
					</button>

					<button className={styles.submit} onClick={onConfirm} type="button">
						{confirmLabel}
					</button>
				</div>
			</div>
		</Modal>

	);
}