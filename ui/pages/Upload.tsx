
import React from 'react';
import FileUploader from '../components/FileUploader';

const Upload: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-start pt-10">
            <FileUploader />
        </div>
    );
};

export default Upload;
