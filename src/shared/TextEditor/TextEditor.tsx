// import React, { useEffect, useRef } from 'react';
// // import SunEditor from 'suneditor-react';
// import 'suneditor/dist/css/suneditor.min.css';
// import styles from './TextEditor.module.css';

// interface TextEditorProps {
// 	name: string;
// 	label: string;
// 	placeholder?: string;
// 	value: string;
// 	 externalValue?: string;
// 	onChange: (val: string) => void;
// 	onBlur?: () => void;
// 	onValueChange?: (val: string) => void; // <-- new optional prop
// }

// const TextEditor: React.FC<TextEditorProps> = ({
// 	name,
// 	label,
// 	placeholder,
// 	value,
// 	externalValue,	
// 	onChange,
// 	onBlur,
// 	onValueChange

// }) => {
// 	// Use any since SunEditor doesn't export a type
// 	const editorRef = useRef<any>(null);
// 	const prevExternalValue = useRef<string>('');

// 	// useEffect(() => {
// 	// 	if (editorRef.current && value !== undefined) {
// 	// 		editorRef.current.setContents(value); // update editor whenever value changes
// 	// 	}
// 	// }, [value]);

// 	  useEffect(() => {
//         if (editorRef.current && externalValue !== prevExternalValue.current) {
//             editorRef.current.setContents(externalValue ?? '');
//             prevExternalValue.current = externalValue ?? '';
//         }
//     }, [externalValue]);



// 	return (
// 		<div className={styles.editorWrapper ?? undefined}>
// 			<label htmlFor={name}>{label}</label>

// 			<SunEditor
// 				getSunEditorInstance={(sunEditor:any) => {
// 					editorRef.current = sunEditor; // store instance
// 				}}
// 				defaultValue={value ?? ''}
// 				onChange={(content:any) => {
// 					onChange(content);            // update RHF state
// 					onValueChange?.(content);     // notify parent about change
// 				}}
// 				onBlur={() => onBlur && onBlur()}
// 				placeholder={placeholder}
// 				setOptions={{
// 					height: '200px',
// 					defaultStyle: 'font-family: Arial, Helvetica, sans-serif; font-size:14px;',
// 					font: [
// 						'Arial', 'Helvetica', 'Verdana', 'Tahoma',
// 						'Times New Roman', 'Georgia', 'Trebuchet MS', 'Courier New'
// 					],
// 					buttonList: [
// 						['font', 'fontSize', 'formatBlock'],
// 						['undo', 'redo'],
// 						['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
// 						['removeFormat'],
// 						'/',
// 						['fontColor', 'hiliteColor', 'outdent', 'indent', 'align', 'horizontalRule', 'list', 'table'],
// 						['fullScreen', 'showBlocks', 'codeView'],
// 						['preview', 'print'],
// 					],
// 				}}
// 			/>
// 		</div>
// 	);
// };

// export default TextEditor;
