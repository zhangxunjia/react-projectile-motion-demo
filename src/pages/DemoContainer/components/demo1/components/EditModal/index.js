import { Form, Input, Modal, Select, InputNumber, message, Button } from 'antd';
import React, { Fragment, useEffect, useMemo } from 'react';
import './index.scss'
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-jsx';// jsx模式的包
import 'ace-builds/src-noconflict/theme-monokai';// monokai的主题样式
import 'ace-builds/src-noconflict/ext-language_tools'; // 代码联想
// import ReactHtmlParser from 'react-html-parser';
import JSXParser from 'react-jsx-parser';
import { animateOptions } from './constants'

const EditModal = (props) => {
    const {
        open = false,
        editData,
        onEditModalCancel,
        onEditModalConfirm,
        editType
    } = props

    const [form] = Form.useForm();

    const onOk = () => {
        form.validateFields()
            .then((porps) => {
                const projectileMotionPorps = {}
                // 去除undefined
                for (let key in porps) {
                    if (porps[key] !== undefined) {
                        // 传入函数参数的处理
                        if(key === 'projectileMovmentEnd' || key === 'endingDomAnimationEnd') {
                            try {
                                projectileMotionPorps[key] = eval(porps[key]);
                                projectileMotionPorps[`${key}Str`] = porps[key];
                            } catch {
                                message.error(`${key}不是合法的函数`)
                                return
                            }
                            // dom处理
                        } else if(key === 'projectile') {
                            try {
                                projectileMotionPorps[key] = <JSXParser jsx={porps[key]} />;
                                projectileMotionPorps[`${key}Str`] = porps[key];
                            } catch {
                                message.error(`${key}不是合法的dom`)
                                return
                            }
                            // 普通参数的处理
                        } else  {
                            projectileMotionPorps[key] = porps[key];
                        }
                    }
                }
                onEditModalConfirm && onEditModalConfirm(
                    {
                        ...editData,
                        projectileMotionPorps
                    },
                    editType
                )

            })
    };

    // 传参modal
    useEffect(() => {
    // 打开modal时，将数据填入表单
        if(open) {
            if(editData.projectileMotionPorps) {
                const {projectileMovmentEndStr, endingDomAnimationEndStr, projectileStr} = editData.projectileMotionPorps
                form.setFieldsValue({
                    ...editData.projectileMotionPorps,
                    projectileMovmentEnd: projectileMovmentEndStr,
                    endingDomAnimationEnd: endingDomAnimationEndStr,
                    projectile: projectileStr
                })
            }
            // 关闭modal时，重置表单
        } else {
            form.resetFields()
        }
    }, [open])

    const formItem = useMemo(() => editType === 'start'
        ? startFormItem()
        : endFormItem(), [editType])

    // 传参样例
    const showSample = () => {
        let value = ''
        // 开始端
        if(editType === 'start') {
            value = `props.triggerProjectileMotion(\n  "${form.getFieldValue('subscription')}",\n  startingDom.current // startingDom.current为用户指定的抛物运动开始的位置 \n);`
            // 结束端
        } else {
            value = `props.setProjectileMotionPorps({\n  endingDom: endingDom.current, // endingDom.current为用户指定的抛物运动结束的位置\n`
            const formFieldsValue = form.getFieldsValue()
            for (let key in formFieldsValue) {
                if (formFieldsValue[key] !== undefined && formFieldsValue[key] !== '') {
                    if(key === 'projectile') {
                        value += `  ${key}: (${formFieldsValue[key]}),\n`
                    } else if(
                        typeof(formFieldsValue[key]) === 'string'
                            && key !== 'projectileMovmentEnd'
                            && key !== 'endingDomAnimationEnd'
                    ) {
                        value += `  ${key}: "${formFieldsValue[key]}",\n`
                    } else {
                        value += `  ${key}: ${formFieldsValue[key]},\n`
                    }
                }
            }
            value += '});'
        }

        Modal.info({
            width: "80%",
            title: '传参样例',
            content: renderAceEditor({
                name:'showSample',
                readOnly:true,
                value
            })
        })
    }

    return (
        <Modal
            open={open}
            title="传参"
            width="80%"
            onCancel={onEditModalCancel}
            onOk={onOk}
            className="edit-modal"
            footer={[
                <Button key="back" onClick={onEditModalCancel}>
                    取消
                </Button>,
                <Button key="example" type="primary" onClick={showSample}>
                    传参样例
                </Button>,
                <Button key="submit" type="primary" onClick={onOk}>
                    保存
                </Button>
            ]}
        >
            <Form
                layout="vertical"
                className="edit-modal-form"
                form={form}
            >
                {formItem}
            </Form>
        </Modal>
    )

};

const startFormItem = () => (
    <>
        <Form.Item name="subscription" label="subscription（pubsub订阅名称）" rules={[{ required: true }]}>
            <Input />
        </Form.Item>
    </>
)

const renderAceEditor = (props) => (
    <AceEditor
        {...props}
        mode="jsx"
        theme="monokai"
        fontSize={14}
        showPrintMargin
        showGutter
        width="100%"
        wrapEnabled
        highlightActiveLine  //突出活动线
        enableSnippets  //启用代码段
        setOptions={{
            enableBasicAutocompletion: true,   //启用基本自动完成功能
            enableLiveAutocompletion: true,   //启用实时自动完成功能 （比如：智能代码提示）
            enableSnippets: true,  //启用代码段
            showLineNumbers: true,
            tabSize: 2
        }}
    />
)

const endFormItem = () => (
    <>
        <Form.Item name="subscription" label="subscription（pubsub订阅名称，类型：string）" rules={[{ required: true }]}>
            <Input />
        </Form.Item>
        <Form.Item name="muiltipleProjectile" label="muiltipleProjectile（是否允许出现多个抛掷物，类型：boolean）" >
            <Select
                allowClear
                placeholder="true"
                options={[
                    { value: true, label: 'true' },
                    { value: false, label: 'false' }
                ]}
            />
        </Form.Item>
        <Form.Item name="projectile" label="projectile（抛掷物，如果要添加className需把样式写在全局，支持jsx写法，类型：ReactNode）" >
            {renderAceEditor({name:'projectile'})}
        </Form.Item>
        <Form.Item name="duration" label="duration（抛掷动画持续的时间，类型：number）" >
            <InputNumber
                size="large"
                min={0}
                placeholder="1"
                style={{ width: '100%' }}
            />
        </Form.Item>
        <Form.Item name="zIndex" label="zIndex（设置抛掷物的zIndex，类型：number）" >
            <InputNumber
                size="large"
                min={0}
                placeholder="2147483647"
                style={{ width: '100%' }}
            />
        </Form.Item>
        <Form.Item name="needEndingDomAnimation" label="needEndingDomAnimation（endingDom是否需要被抛掷物击中后动画，类型：boolean）" >
            <Select
                placeholder="true"
                options={[
                    { value: true, label: 'true' },
                    { value: false, label: 'false' }
                ]}
            />
        </Form.Item>
        <Form.Item name="projectileMovmentEnd" label="projectileMovmentEnd（抛物运动动画结束回调，类型：function） 例如: () => { console.log(1) }" >
            {renderAceEditor({name:'projectileMovmentEnd'})}
        </Form.Item>
        <Form.Item name="endingDomAnimationEnd" label="endingDomAnimationEnd（endingDom动画结束回调，类型：function）例如: () => { console.log(1) }" >
            {renderAceEditor({name:'endingDomAnimationEnd'})}
        </Form.Item>
        <Form.Item name="endingDomAnimationDuration" label="endingDomAnimationDuration（endingDom被抛掷物击中后动画持续时间，类型：number）" >
            <InputNumber
                size="large"
                min={0}
                placeholder="1"
                style={{ width: '100%' }}
            />
        </Form.Item>
        <Form.Item name="endingDomAnimationName" label={<span>endingDomAnimationName（endingDom被抛掷物击中后的animation的名称，类型：string， 本Demo内置animate,若项目需使用请先安装进行npm install animate.css --save 然后导入import 'animate.css', 或按需引入需要的样式  详情请参考 <a target="_blank" href="https://animate.style/" alt="#" rel="noreferrer" >https://animate.style/</a> ）</span>} >
            <Select
                showSearch
                options={animateOptions}
            >
            </Select>
        </Form.Item>
        <Form.Item name="additionalTransformValueInAnimate" label="additionalTransformValueInAnimate（补充的动画的transform值，传入该值后会生成新的类名，该类会整合endingDomAnimationName对应的keyframe除最后一帧外的其他帧，形成新的类，然后供endingDom应用。可以设置rotate scale translate skew 等值，若设置多个请用空格隔开）" >
            <Input />
        </Form.Item>
        <Form.Item name="wrapClassName" label="wrapClassName（抛掷物外层容器的类名，类型：string）">
            <Input />
        </Form.Item>
        <Form.Item name="isInitialYAxisReverse" label="isInitialYAxisReverse（抛物运动初速度y轴方向是否为反方向，类型：boolean）" >
            <Select
                allowClear
                placeholder="true"
                options={[
                    { value: true, label: 'true' },
                    { value: false, label: 'false' }
                ]}
            />
        </Form.Item>
        <Form.Item name="projectileTransition" label="projectileTransition（自定义抛掷物的transition属性若传入此属性则duration和isInitialYAxisReverse将失效，类型：string）" >
            <Input />
        </Form.Item>
    </>
)

export default EditModal;