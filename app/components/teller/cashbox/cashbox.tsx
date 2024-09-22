import React, { useState } from "react";
import { Button, Col, Flex, Modal, Row, Spin, Table, Typography } from "antd";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";

import useCashbox from "./cashbox.hooks";
import UpdateCashForm from "./forms/update_form";
import { CashBoxProps, UpdateType } from "./cashbox.types";

const Cashbox = (props: CashBoxProps) => {
  const { open, close } = props;
  const {
    tableProps,
    logs,
    loading,
    initBalance,
    currentBalance,
    manualCashUpdateHandler,
    openUpdateForm,
    setOpenUpdateForm,
    closeAndReset,
    exportExcel,
  } = useCashbox(props);

  return (
    <>
      <Modal
        open={open}
        onCancel={close}
        closable={false}
        footer={null}
        width={1000}
        title={
          <Flex justify="space-between">
            <Typography.Title level={3}>Disbursement/Cash Box</Typography.Title>
            <Button size="large" onClick={exportExcel} type="primary">
              Export/Download CB Report
            </Button>
          </Flex>
        }
        zIndex={1}
      >
        <Spin spinning={loading == "adding"}>
          <Row gutter={16}>
            <Col
              span={9}
              style={{
                display: "flex",
                gap: 8,
              }}
            >
              <div
                style={{
                  border: "1px solid #d9d9d9",
                  borderRadius: 8,
                  width: 120,
                }}
              >
                <div
                  style={{
                    background: "#d9d9d9",
                    padding: 10,
                  }}
                >
                  <Typography.Title
                    level={4}
                    style={{
                      fontFamily: "abel",
                      margin: 0,
                      textWrap: "nowrap",
                    }}
                  >
                    Current cash
                  </Typography.Title>
                </div>
                <div
                  style={{
                    padding: 10,
                    fontSize: "1.5em",
                    textAlign: "end",
                    textWrap: "nowrap",
                  }}
                >
                  ₱{" "}
                  {currentBalance?.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
              <div
                style={{
                  border: "1px solid #d9d9d9",
                  borderRadius: 8,
                  width: 120,
                }}
              >
                <div
                  style={{
                    background: "#d9d9d9",
                    padding: 10,
                  }}
                >
                  <Typography.Title
                    level={4}
                    style={{
                      fontFamily: "abel",
                      margin: 0,
                    }}
                  >
                    Initial cash
                  </Typography.Title>
                </div>
                <div
                  style={{
                    padding: 10,
                    fontSize: "1.5em",
                    textAlign: "end",
                  }}
                >
                  ₱{" "}
                  {initBalance?.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            </Col>
            <Col span={6} offset={9}>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <Button
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={() =>
                    setOpenUpdateForm({ open: true, updateType: "add" })
                  }
                  block
                >
                  ADD
                </Button>
                <Button
                  size="large"
                  icon={<MinusOutlined />}
                  onClick={() =>
                    setOpenUpdateForm({ open: true, updateType: "deduct" })
                  }
                  block
                  danger
                >
                  DEDUCT
                </Button>
              </div>
            </Col>
          </Row>

          <Table
            columns={tableProps.columns}
            style={{ marginTop: 8 }}
            scroll={{ y: "50vh" }}
            dataSource={logs}
          />
        </Spin>
      </Modal>

      {/* context */}
      <UpdateCashForm
        close={closeAndReset}
        {...openUpdateForm}
        {...manualCashUpdateHandler}
      />
    </>
  );
};

export default Cashbox;
