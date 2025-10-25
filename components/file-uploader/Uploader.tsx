"use client";

import { useCallback, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";
import { RenderEmptyState, RenderErrorState } from "./RenderState";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface UploaderState {
	id: string | null;
	file: File | null;
	uploading: boolean;
	progress: number;
	key?: string;
	isDeleting: boolean;
	error: boolean;
	objectUrl?: string;
	fileType: "image" | "video";
}

export function Uploader() {
	const [fileState, setFileState] = useState<UploaderState>({
		id: null,
		file: null,
		uploading: false,
		progress: 0,
		isDeleting: false,
		error: false,
		fileType: "image",
	});

	async function uploadFile(file: File) {
		setFileState((prev) => ({
			...prev,
			uploading: true,
			progress: 0,
		}));

		try {
			const presignedResponse = await fetch("/api/s3/upload", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					fileName: file.name,
					contentType: file.type,
					size: file.size,
					isImage: true,
				}),
			});

			if (!presignedResponse.ok) {
				toast.error("Failed to get presigned URL");
				setFileState((prev) => ({
					...prev,
					uploading: false,
					progress: 0,
					error: true,
				}));

				return;
			}

			const { presignedUrl, key } = await presignedResponse.json();

			await new Promise<void>((resolve, reject) => {
				const xhr = new XMLHttpRequest();
				xhr.upload.onprogress = (event) => {
					if (event.lengthComputable) {
						const percentageCompleted = (event.loaded / event.total) * 100;
						setFileState((prev) => ({
							...prev,
							progress: Math.round(percentageCompleted),
						}));
					}
				};
				xhr.onload = () => {
					if (xhr.status === 200 || xhr.status === 204) {
						setFileState((prev) => ({
							...prev,
							progress: 100,
							uploading: false,
							key: key,
						}));
						toast.success("File Uploaded Successfully");
						resolve();
					} else {
						reject(new Error("Upload Failed..."));
					}
				};
				xhr.onerror = () => {
					reject(new Error("Upload Failed"));
				};

				xhr.open("PUT", presignedUrl);
				xhr.setRequestHeader("Content-Type", file.type);
				xhr.send(file);
			});
		} catch {
			toast.error("Something went wrong");
			setFileState((prev) => ({
				...prev,
				progress: 0,
				uploading: false,
			}));
		}
	}

	const onDrop = useCallback((acceptedFile: File[]) => {
		if (acceptedFile.length > 0) {
			const file = acceptedFile[0];
			setFileState({
				id: uuidv4(),
				file: file,
				uploading: false,
				progress: 0,
				isDeleting: false,
				error: false,
				objectUrl: URL.createObjectURL(file),
				fileType: "image",
			});

			uploadFile(file);
		}
	}, []);

	function rejectedFiles(fileRejection: FileRejection[]) {
		if (fileRejection.length) {
			const tooManyFiles = fileRejection.find(
				(rejection) => rejection.errors[0].code == "too-many-files"
			);

			const fileSizeToBig = fileRejection.find(
				(rejection) => rejection.errors[0].code == "file-too-large"
			);

			if (fileSizeToBig) {
				toast.error("File size exceed the limit 5 MB");
			}

			if (tooManyFiles) {
				toast.error("Too many files selected, max is 1");
			}
		}
	}

	function renderContent() {
		if (fileState.uploading) {
			return <h1>Uploading..</h1>;
		}
		if (fileState.error) {
			return <RenderErrorState />;
		}
		if (fileState.objectUrl) {
			return <h1>Uploaded File</h1>;
		}
		return <RenderEmptyState isDragActive={isDragActive} />;
	}

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: { "image/*": [] },
		maxFiles: 1,
		multiple: false,
		maxSize: 5 * 1024 * 1024,
		onDropRejected: rejectedFiles,
	});

	return (
		<Card
			{...getRootProps()}
			className={cn(
				"relative border-2 border-dashed transition-colors duration-200 ease-in-out w-full h-64",
				isDragActive
					? "border-primary bg-primary/10 border-solid"
					: "border-border hover:border-primary"
			)}
		>
			<CardContent className="flex items-center justify-center w-full h-full p-4">
				<input {...getInputProps()} />
				{renderContent()}
			</CardContent>
		</Card>
	);
}
