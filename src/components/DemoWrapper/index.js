import React, { forwardRef } from 'react'
import { Spin } from 'antd'
import './index.scss'

const DemoWrapper = forwardRef((props, ref) => (
    <>
        <Spin className="demo-wrapper-spin"  spinning={props.loading} />
        <div
            ref={ref}
            className={`demo-wrapper-container ${props.className}`}
            style={{ display: props.loading ? 'none' : 'block'}}
        >
            {props.children}
        </div>
    </>
))

export default DemoWrapper
