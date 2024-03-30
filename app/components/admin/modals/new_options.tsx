import React, { ReactNode, useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Tooltip,
  Typography,
  message,
} from "antd";
import {
  QuestionCircleOutlined,
  CloseOutlined,
  CheckOutlined,
} from "@ant-design/icons";

import BillServices from "@/provider/bill.service";

import {
  NewOptionProps,
  BillingOptionsType,
  BillingsFormField,
  SelectItem,
} from "@/types";

// TODO: fix select name with options update (name not updated)

const NewOption = ({
  open,
  close,
  formfield,
  onSave,
  index,
  id,
  refresh,
  markAsMain,
  deleteOption,
}: NewOptionProps) => {
  const [form] = Form.useForm();
  const [selectedType, setSelectedType] = useState<BillingOptionsType | null>(
    null
  );
  const [extraOption, setExtraOption] = useState<BillingsFormField | null>();
  const [input, setInput] = useState<string>("");
  const [name, setName] = useState("");

  const bill = new BillServices();

  const handleOnFinish = () => {
    (async () => {
      await validate(extraOption)
        .then(() => {
          if (extraOption) onSave(extraOption);
          clearAll();
        })
        .catch((e) => message.error(e));
    })();
  };

  const validate = (
    opt: BillingsFormField | null | undefined
  ): Promise<String | void> => {
    return new Promise((resolve, reject) => {
      if (opt) {
        switch (opt.type) {
          case "input": {
            let min = opt.inputOption?.minLength ?? 0;
            let max = opt.inputOption?.maxLength ?? 0;

            if (min > max)
              reject("Minimum Length should be lower than Maximum");
            resolve();
          }

          case "number": {
            let min = opt.inputNumberOption?.min ?? 0;
            let max = opt.inputNumberOption?.max ?? 0;

            if (min > max)
              reject("Minimum number should be lower than Maximum");
            resolve();
          }

          case "textarea": {
            let min = opt.textareaOption?.minRow ?? 0;
            let max = opt.textareaOption?.maxRow ?? 0;

            if (min > max) reject("Minimum row should be lower than Maximum");
            resolve();
          }

          case "select": {
            if (
              !(opt.selectOption?.items && opt.selectOption?.items.length > 0)
            )
              reject("Select should have atleast 1 menu");
            resolve();
          }

          case "checkbox":
            resolve();
        }
      } else return false;
    });
  };

  const clearAll = () => {
    setInput("");
    setExtraOption(null);
    setName("");
    setSelectedType(null);
    form.resetFields();
    close();
  };

  const handleDeleteOption = async () => {
    if (id) {
      let flag = await deleteOption(id, index);

      if (flag) {
        clearAll();
        if (refresh) refresh();
      }
    }
  };

  const updateName = (name: string) => {
    switch (selectedType) {
      case "input": {
        setExtraOption({
          type: selectedType,
          name,
          inputOption: extraOption?.inputOption,
        });
        break;
      }
      case "number": {
        setExtraOption({
          type: selectedType,
          name,
          inputNumberOption: extraOption?.inputNumberOption,
        });
        break;
      }
      case "textarea": {
        setExtraOption({
          type: selectedType,
          name,
          textareaOption: extraOption?.textareaOption,
        });
        break;
      }
      case "checkbox": {
        setExtraOption({
          type: selectedType,
          name,
        });
        break;
      }
      case "select": {
        setExtraOption({
          type: selectedType,
          name,
          selectOption: extraOption?.selectOption,
        });
        break;
      }
    }
  };

  const optionalHeader = ({ children }: { children: ReactNode }) => (
    <div style={{ marginTop: 10, display: "flex", flexDirection: "column" }}>
      <Typography.Text
        type="secondary"
        style={{
          fontSize: "1.2em",
        }}
      >
        Optional Settings{" "}
        <Tooltip title="You can leave the option blank if not necessary">
          <QuestionCircleOutlined />
        </Tooltip>
      </Typography.Text>
      {children}
    </div>
  );

  const getAdditionalOptions = (type: BillingOptionsType | null): ReactNode => {
    switch (type) {
      case "input":
        return optionalHeader({
          children: (
            <Space direction="vertical">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: 190,
                }}
              >
                <label style={{ fontSize: "1.25em", marginRight: 10 }}>
                  Minimum Length
                </label>
                <InputNumber
                  min={0}
                  className="custom-inputnumber"
                  style={{
                    width: 50,
                    textAlign: "center",
                  }}
                  value={extraOption?.inputOption?.minLength}
                  onChange={(e) => {
                    const minLength = e;
                    const maxLength = extraOption?.inputOption?.maxLength;
                    setExtraOption({
                      type: selectedType!,
                      name: formfield != null ? formfield.name : name,
                      inputOption: {
                        minLength,
                        maxLength,
                      },
                    });
                  }}
                  controls={false}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: 190,
                }}
              >
                <label style={{ fontSize: "1.25em", marginRight: 10 }}>
                  Maximum Length
                </label>
                <InputNumber
                  min={0}
                  className="custom-inputnumber"
                  style={{
                    maxWidth: 50,
                    textAlign: "center",
                  }}
                  controls={false}
                  value={extraOption?.inputOption?.maxLength}
                  onChange={(e) => {
                    const minLength = extraOption?.inputOption?.minLength;
                    const maxLength = e;
                    setExtraOption({
                      type: selectedType!,
                      name: formfield != null ? formfield.name : name,
                      inputOption: {
                        minLength,
                        maxLength,
                      },
                    });
                  }}
                />
              </div>
            </Space>
          ),
        });

      case "number":
        return optionalHeader({
          children: (
            <Space direction="vertical">
              <div
                style={{
                  display: "flex",
                  width: 130,
                }}
              >
                <label style={{ fontSize: "1.25em", marginRight: 17 }}>
                  Is Money
                </label>
                <Checkbox
                  checked={extraOption?.inputNumberOption?.isMoney ?? false}
                  onChange={(e) => {
                    const min = extraOption?.inputNumberOption?.min;
                    const max = extraOption?.inputNumberOption?.max;
                    setExtraOption({
                      type: selectedType!,
                      name: formfield != null ? formfield.name : name,
                      inputNumberOption: {
                        min,
                        max,
                        mainAmount: formfield?.inputNumberOption?.mainAmount,
                        isMoney: e.target.checked,
                      },
                    });
                  }}
                />
              </div>
              {/* <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: 130,
                }}
              >
                <label style={{ fontSize: "1.25em", marginRight: 15 }}>
                  Minimum
                </label>
                <InputNumber
                  min={0}
                  className="custom-inputnumber"
                  style={{
                    maxWidth: 70,
                    textAlign: "center",
                  }}
                  controls={false}
                  value={extraOption?.inputNumberOption?.min}
                  onChange={(e) => {
                    const min = e;
                    const max = extraOption?.inputNumberOption?.max;
                    setExtraOption({
                      type: selectedType!,
                      name: formfield != null ? formfield.name : name,
                      inputNumberOption: {
                        min,
                        max,
                        mainAmount: formfield?.inputNumberOption?.mainAmount,
                        isMoney: formfield?.inputNumberOption?.isMoney ?? false,
                      },
                    });
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: 130,
                }}
              >
                <label style={{ fontSize: "1.25em", marginRight: 10 }}>
                  Maximum
                </label>
                <InputNumber
                  min={0}
                  className="custom-inputnumber"
                  style={{
                    maxWidth: 70,
                    textAlign: "center",
                  }}
                  controls={false}
                  value={extraOption?.inputNumberOption?.max}
                  onChange={(e) => {
                    const min = extraOption?.inputNumberOption?.min;
                    const max = e;
                    setExtraOption({
                      type: selectedType!,
                      name: formfield != null ? formfield.name : name,
                      inputNumberOption: {
                        min,
                        max,
                        mainAmount: formfield?.inputNumberOption?.mainAmount,
                        isMoney: formfield?.inputNumberOption?.isMoney ?? false,
                      },
                    });
                  }}
                />
              </div> */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: 190,
                }}
              >
                <label style={{ fontSize: "1.25em", marginRight: 10 }}>
                  Minimum Length
                </label>
                <InputNumber
                  min={0}
                  className="custom-inputnumber"
                  style={{
                    width: 50,
                    textAlign: "center",
                  }}
                  value={extraOption?.inputNumberOption?.minLength}
                  onChange={(e) => {
                    const minLength = e;
                    const maxLength = extraOption?.inputNumberOption?.maxLength;
                    const min = extraOption?.inputNumberOption?.min;
                    const max = extraOption?.inputNumberOption?.max;
                    const mainAmount =
                      extraOption?.inputNumberOption?.mainAmount;
                    setExtraOption({
                      type: selectedType!,
                      name: formfield != null ? formfield.name : name,
                      inputNumberOption: {
                        minLength,
                        maxLength,
                        min,
                        max,
                        mainAmount,
                      },
                    });
                  }}
                  controls={false}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: 190,
                }}
              >
                <label style={{ fontSize: "1.25em", marginRight: 10 }}>
                  Maximum Length
                </label>
                <InputNumber
                  min={0}
                  className="custom-inputnumber"
                  style={{
                    maxWidth: 50,
                    textAlign: "center",
                  }}
                  controls={false}
                  value={extraOption?.inputNumberOption?.maxLength}
                  onChange={(e) => {
                    const minLength = extraOption?.inputNumberOption?.minLength;
                    const maxLength = e;
                    const min = extraOption?.inputNumberOption?.min;
                    const max = extraOption?.inputNumberOption?.max;
                    const mainAmount =
                      extraOption?.inputNumberOption?.mainAmount;
                    setExtraOption({
                      type: selectedType!,
                      name: formfield != null ? formfield.name : name,
                      inputNumberOption: {
                        minLength,
                        maxLength,
                        min,
                        max,
                        mainAmount,
                      },
                    });
                  }}
                />
              </div>
            </Space>
          ),
        });

      case "textarea":
        return optionalHeader({
          children: (
            <Space direction="vertical">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: 160,
                }}
              >
                <label style={{ fontSize: "1.25em", marginRight: 10 }}>
                  Minimum Row
                </label>
                <InputNumber
                  min={0}
                  className="custom-inputnumber"
                  style={{
                    maxWidth: 50,
                    textAlign: "center",
                  }}
                  controls={false}
                  value={extraOption?.textareaOption?.minRow}
                  onChange={(e) => {
                    const minRow = e;
                    const maxRow = extraOption?.textareaOption?.maxRow;
                    setExtraOption({
                      type: selectedType!,
                      name: formfield != null ? formfield.name : name,
                      textareaOption: {
                        minRow,
                        maxRow,
                      },
                    });
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: 160,
                }}
              >
                <label style={{ fontSize: "1.25em", marginRight: 10 }}>
                  Maximum Row
                </label>
                <InputNumber
                  min={0}
                  className="custom-inputnumber"
                  style={{
                    maxWidth: 50,
                    textAlign: "center",
                  }}
                  controls={false}
                  value={extraOption?.textareaOption?.maxRow}
                  onChange={(e) => {
                    const minRow = extraOption?.textareaOption?.minRow;
                    const maxRow = e;
                    setExtraOption({
                      type: selectedType!,
                      name: formfield != null ? formfield.name : name,
                      textareaOption: {
                        minRow,
                        maxRow,
                      },
                    });
                  }}
                />
              </div>
            </Space>
          ),
        });

      case "select":
        return optionalHeader({
          children: (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div>
                <Input
                  style={{ width: 150, marginRight: 10 }}
                  placeholder="Type your menu here..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <Button
                  type="primary"
                  onClick={(e) => {
                    if (input == "") {
                      message.warning("Input is empty.");
                      return;
                    }

                    if (
                      extraOption?.selectOption?.items &&
                      extraOption?.selectOption?.items.filter(
                        (_) =>
                          _.name.toLocaleLowerCase() ==
                          input.toLocaleLowerCase()
                      ).length > 0
                    ) {
                      message.warning("Already added.");
                      return;
                    }

                    let arr: SelectItem[] = [
                      ...(extraOption?.selectOption?.items ?? []),
                      {
                        name: input,
                        value: input.replaceAll(" ", "_").toLocaleLowerCase(),
                      },
                    ];

                    setExtraOption({
                      type: selectedType!,
                      name: formfield != null ? formfield.name : name,
                      selectOption: {
                        items: arr,
                      },
                    });
                    setInput("");
                  }}
                >
                  ADD
                </Button>
              </div>
              <Space
                direction="vertical"
                style={{
                  marginTop: 10,
                }}
              >
                {extraOption?.selectOption?.items &&
                  extraOption?.selectOption?.items.map((e, i) => (
                    <div
                      key={`${e.value}-${i}`}
                      style={{
                        width: 150,
                        border: "0.5px solid #b7b7b7",
                        height: 35,
                        borderRadius: 5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.4em",
                        position: "relative",
                        color: "#000000e0",
                      }}
                    >
                      <Typography.Paragraph
                        style={{
                          maxWidth: 110,
                          marginTop: 17.5,
                        }}
                        ellipsis={{ rows: 1 }}
                      >
                        {e.name}
                      </Typography.Paragraph>
                      <CloseOutlined
                        onClick={() => {
                          if (extraOption?.selectOption?.items) {
                            setExtraOption({
                              type: "select",
                              name: extraOption?.name ?? "",
                              selectOption: {
                                items: extraOption?.selectOption?.items.filter(
                                  (_, __) => __ != i
                                ),
                              },
                            });
                          }
                        }}
                        style={{
                          position: "absolute",
                          right: 8,
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                      />
                    </div>
                  ))}
              </Space>
            </div>
          ),
        });
    }
  };

  const updateFieldValue = () => {
    form.setFieldsValue({
      type: formfield?.type ?? null,
      title: formfield?.name,
    });
  };

  const markMain = async () => {
    if (id) {
      let flag = await markAsMain(id, index);

      if (flag) {
        clearAll();
        if (refresh) refresh();
      }
    }
  };

  useEffect(() => {
    setSelectedType(formfield?.type ?? null);
    updateFieldValue();
    setExtraOption(formfield);
  }, [formfield]);

  return (
    <Modal
      open={open}
      onCancel={clearAll}
      footer={[
        formfield &&
        formfield.type == "number" &&
        formfield.inputNumberOption?.mainAmount == true ? (
          <Tooltip title="Already Marked as Main Amount">
            <Button key="main-mark-option-btn-disabled" type="primary" disabled>
              Mark as Main Amount <CheckOutlined />
            </Button>
          </Tooltip>
        ) : formfield &&
          formfield.type == "number" &&
          formfield.inputNumberOption?.mainAmount == false ? (
          <Button key="main-mark-option-btn" type="primary" onClick={markMain}>
            Mark as Main Amount
          </Button>
        ) : null,
        formfield != null ? (
          <Popconfirm
            key="remove-option-btn"
            title="Are you sure you want to delete this?"
            onConfirm={handleDeleteOption}
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        ) : null,
        <Button key="add-option-btn" type="primary" onClick={form.submit}>
          {formfield != null ? "Update Option" : "Add Option"}
        </Button>,
      ]}
      destroyOnClose
    >
      <Form
        form={form}
        colon={false}
        labelAlign="left"
        labelCol={{
          flex: "90px",
        }}
        wrapperCol={{
          flex: 1,
        }}
        onFinish={handleOnFinish}
        labelWrap
      >
        <Form.Item
          label={
            <Typography.Text style={{ fontSize: "1.6em" }}>
              Name
            </Typography.Text>
          }
          name="title"
          style={{
            marginTop: 25,
          }}
          rules={[
            { required: true, message: "Title is empty. Please provide." },
          ]}
        >
          <Input
            style={{ display: "block" }}
            value={name}
            onChange={(e) => {
              updateName(e.target.value);
              setName(e.target.value);
            }}
          />
        </Form.Item>
        <Form.Item
          label={
            <Typography.Text style={{ fontSize: "1.6em" }}>
              Type
            </Typography.Text>
          }
          name="type"
          style={{
            marginTop: 25,
          }}
          rules={[
            {
              required: true,
              message: "Type is Required. Please provide.",
            },
          ]}
        >
          <Select
            placeholder="Choose a Type"
            style={{
              width: 150,
            }}
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e);
              setExtraOption({
                type: e,
                name: formfield?.name ?? name,
              });
            }}
            options={[
              {
                label: "Input",
                value: "input",
              },
              {
                label: "Input Number",
                value: "number",
              },
              {
                label: "Text Area",
                value: "textarea",
              },
              {
                label: "Checkbox",
                value: "checkbox",
              },
              {
                label: "Select",
                value: "select",
              },
            ]}
          />
        </Form.Item>

        <div className="additional-options-container">
          {getAdditionalOptions(selectedType)}
        </div>
      </Form>
    </Modal>
  );
};

export { NewOption };
