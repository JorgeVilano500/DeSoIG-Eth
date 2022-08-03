// ImageUpload : Shows the user a preview of the selected Image and returns the URL after uploading .
import React, { useState } from 'react'
import { ImageUpload } from 'react-ipfs-uploader'

const FileUploader = (props) => {
    const [imageUrl, setImageUrl] = useState('')

    return (
        <div>
            <ImageUpload setUrl={setImageUrl} />
            ImageUrl : <a
                href={imageUrl}
                target='_blank'
                rel='noopener noreferrer'
                
            >
                {imageUrl}
            </a>
        </div>
    )
}

export default FileUploader;

//onChange={props.onChange} accept='.jpg, .jpeg, .png, .bmp, .gif'