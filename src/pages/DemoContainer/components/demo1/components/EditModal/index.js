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
import { useTranslation } from 'react-i18next';

const EditModal = (props) => {
    const {
        open = false,
        editData,
        onEditModalCancel,
        onEditModalConfirm,
        editType
    } = props

    const { t } = useTranslation();

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
                                message.error(`${key}${t('Not a legal function')}`)
                                return
                            }
                            // dom处理
                        } else if(key === 'projectile') {
                            try {
                                projectileMotionPorps[key] = <JSXParser jsx={porps[key]} />;
                                projectileMotionPorps[`${key}Str`] = porps[key];
                            } catch {
                                message.error(`${key}${t('Not a legal dom')}`)
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
        ? startFormItem(t)
        : endFormItem(t), [editType])

    // 传参样例
    const showSample = () => {
        let value = ''
        // 开始端
        if(editType === 'start') {
            value = `props.triggerProjectileMotion(\n  "${form.getFieldValue('subscription')}",\n  startingDom.current // ${t('startingDom.current is the starting position of the projectile motion specified by the user')} \n);`
            // 结束端
        } else {
            value = `props.setProjectileMotionPorps({\n  endingDom: endingDom.current, // ${t('endingDom.current is the end position of the parabolic motion specified by the user')}\n`
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
            title: t('Example of pass parameter'),
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
            title={t('Pass parameter')}
            width="80%"
            onCancel={onEditModalCancel}
            onOk={onOk}
            className="edit-modal"
            footer={[
                <Button key="back" onClick={onEditModalCancel}>
                    {t('Cancel')}
                </Button>,
                <Button key="example" type="primary" onClick={showSample}>
                    {t('Example of pass parameter')}
                </Button>,
                <Button key="submit" type="primary" onClick={onOk}>
                    {t('Save')}
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

const startFormItem = (t) => (
    <>
        <Form.Item name="subscription" label={t('subscription (pubsub subscription name, type: string)')} rules={[{ required: true }]}>
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

const endFormItem = (t) => (
    <>
        <Form.Item name="subscription" label={t('subscription (pubsub subscription name, type: string)')} rules={[{ required: true }]}>
            <Input />
        </Form.Item>
        <Form.Item name="muiltipleProjectile" label={t('muiltipleProjectile (whether multiple throwable objects are allowed to appear, type: boolean)')} >
            <Select
                allowClear
                placeholder="true"
                options={[
                    { value: true, label: 'true' },
                    { value: false, label: 'false' }
                ]}
            />
        </Form.Item>
        <Form.Item name="projectile" label={t('projectile (projectile, if you want to add className, you need to write the style globally, support jsx writing, type: ReactNode)')} >
            {renderAceEditor({name:'projectile'})}
        </Form.Item>
        <Form.Item name="duration" label={t('duration (the duration of the throwing animation, unit: seconds, type: number)')} >
            <InputNumber
                size="large"
                min={0}
                placeholder="1"
                style={{ width: '100%' }}
            />
        </Form.Item>
        <Form.Item name="zIndex" label={t('zIndex (set the zIndex of the projectile, type: number)')} >
            <InputNumber
                size="large"
                min={0}
                placeholder="2147483647"
                style={{ width: '100%' }}
            />
        </Form.Item>
        <Form.Item name="needEndingDomAnimation" label={t('needEndingDomAnimation (whether endingDom needs to animate after being hit by a projectile, type: boolean)')} >
            <Select
                placeholder="true"
                options={[
                    { value: true, label: 'true' },
                    { value: false, label: 'false' }
                ]}
            />
        </Form.Item>
        <Form.Item name="projectileMovmentEnd" label={t('projectileMovmentEnd (projectile motion animation end callback, type: function) For example: () => { console.log(1) }')} >
            {renderAceEditor({name:'projectileMovmentEnd'})}
        </Form.Item>
        <Form.Item name="endingDomAnimationEnd" label={t('endingDomAnimationEnd (endingDom animation end callback, type: function) For example: () => { console.log(1) }')} >
            {renderAceEditor({name:'endingDomAnimationEnd'})}
        </Form.Item>
        <Form.Item name="endingDomAnimationDuration" label={t('endingDomAnimationDuration (endingDom animation duration after being hit by a projectile, unit: seconds, type: number)')} >
            <InputNumber
                size="large"
                min={0}
                placeholder="1"
                style={{ width: '100%' }}
            />
        </Form.Item>
        <Form.Item name="endingDomAnimationName" label={<span>{t("endingDomAnimationName (the name of the animation after endingDom is hit by a projectile. The animation needs to be defined globally, type: string. This Demo has built-in animate.css. If the project needs to use it, please install it first and perform npm install animate.css --save and then import it globally. import 'animate.css', or introduce the required styles as needed, please refer to")} <a target="_blank" href="https://animate.style/" alt="#" rel="noreferrer" >https://animate.style/</a> ）</span>} >
            <Select
                showSearch
                options={animateOptions}
            >
            </Select>
        </Form.Item>
        <Form.Item name="additionalTransformValueInAnimate" label={<span>{t('additionalTransformValueInAnimate (supplementary animation transform value. After passing in this value, a new class name will be generated. This class will integrate all frames except the last frame of the keyframe corresponding to endingDomAnimationName to form a new class, which can then be used by endingDom. It can be set rotate scale translate skew and other values, if you set multiple values, please separate them with spaces)')} <a target="_blank" href="https://raw.githubusercontent.com/zhangxunjia/pictures/main/react-projectile-motion/additionalTransformValueInAnimate_en.png" alt="#" rel="noreferrer" >{t('Graphical details')}</a></span>}>
            <Input />
        </Form.Item>
        <Form.Item name="wrapClassName" label={t('wrapClassName (class name of the outer container of the projectile, type: string)')}>
            <Input />
        </Form.Item>
        <Form.Item name="isInitialYAxisReverse" label={t('isInitialYAxisReverse (whether the initial velocity of the parabolic motion is in the opposite direction of the y-axis, type: boolean)')} >
            <Select
                allowClear
                placeholder="true"
                options={[
                    { value: true, label: 'true' },
                    { value: false, label: 'false' }
                ]}
            />
        </Form.Item>
        <Form.Item name="projectileTransition" label={t('projectileTransition (if the transition attribute of a custom projectile is passed in, duration and isInitialYAxisReverse will be invalid, type: string)')} >
            <Input />
        </Form.Item>
    </>
)

export default EditModal;