import React, { useEffect, useState } from "react";
import { Drawer, Layout, Affix, Menu, Button, Typography, message } from "antd";
import {
  DownOutlined,
  BarChartOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { PiGitBranchFill } from "react-icons/pi";

import {
  Transaction,
  TransactionReportProps,
  Branch as BranchProp,
  BranchData as BranchProp2,
} from "@/types";
import BillService from "@/provider/bill.service";
import ReportDashboard from "./components/dashboard";
import Branch from "./components/branch";
import NewBranch from "./components/new_branch";
import BranchService from "@/provider/branch.service";

interface OpenBranch {
  open: boolean;
  data: BranchProp2 | null;
}

const Report = ({ open, close }: TransactionReportProps) => {
  const [recentTransaction, setRecentTransction] = useState<Transaction[]>([]);
  const [branches, setBranches] = useState<BranchProp2[]>([]);
  const [activeKey, setActiveKey] = useState("branch");
  const [trigger, setTrigger] = useState(0);

  const bill = new BillService();
  const branch = new BranchService();

  // * for branch etc
  const [openNewBranch, setOpenNewBranch] = useState<OpenBranch>({
    open: false,
    data: null,
  });

  const handleNewBranch = (mode: string, obj: BranchProp | BranchProp2) => {
    (async (_) => {
      let res;
      if (mode == "new") res = await _.newBranch(obj);
      else res = await _.updateBranch(obj as BranchProp2);

      if (res?.success ?? false) {
        message.success(res?.message ?? "Success");
        setTrigger(trigger + 1);
        setOpenNewBranch({ open: false, data: null });
      }
    })(branch);
  };

  const handleOpenEdit = (obj: BranchProp2) => {
    setOpenNewBranch({ open: true, data: obj });
  };

  useEffect(() => {
    (async (_, __) => {
      let res = await _.getAllTransaction(1, 10);
      if (res?.success ?? false) setRecentTransction(res?.data ?? []);

      let res2 = await __.getBranch({});
      if (res2?.success ?? false) setBranches(res2?.data ?? []);
    })(bill, branch);
  }, [trigger]);

  return (
    <>
      <Drawer
        open={open}
        onClose={() => {
          setActiveKey("branch");
          close();
        }}
        placement="bottom"
        height="100%"
        width="100%"
        closeIcon={<DownOutlined />}
        title="Report"
        styles={{
          body: {
            padding: 0,
            overflow: "hidden",
          },
        }}
      >
        <Layout>
          <Affix>
            <Layout.Sider theme="light" width={180} collapsible>
              <Menu
                // onClick={selectedIndex}
                // selectedKeys={selectedKey}
                selectedKeys={[activeKey]}
                onClick={(e) => setActiveKey(e.key)}
                items={[
                  {
                    label: "Branches",
                    key: "branch",
                    icon: <PiGitBranchFill />,
                  },
                  {
                    label: "Transaction",
                    key: "dashboard",
                    icon: <BarChartOutlined />,
                  },
                ]}
                // defaultSelectedKeys="dashboard"
                style={{
                  fontSize: 17,
                  height: "100vh",
                  paddingLeft: 5,
                  paddingRight: 10,
                }}
              />
            </Layout.Sider>
          </Affix>
          <Layout>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                margin: 15,
              }}
            >
              <Typography.Title level={3}>
                {activeKey.toLocaleUpperCase()}
                <Typography.Text type="secondary" style={{ marginLeft: 10 }}>
                  {activeKey == "branch" ? "Manage Branch(es)" : ""}
                </Typography.Text>
              </Typography.Title>
              {activeKey == "branch" && (
                <Button
                  type="primary"
                  onClick={() => setOpenNewBranch({ open: true, data: null })}
                  size="large"
                  icon={<PlusOutlined />}
                >
                  NEW BRANCH
                </Button>
              )}
            </div>
            {activeKey == "dashboard" ? (
              <ReportDashboard transaction={recentTransaction} />
            ) : null}
            {activeKey == "branch" ? (
              <Branch branches={branches} openEdit={handleOpenEdit} />
            ) : null}
          </Layout>
        </Layout>
      </Drawer>

      {/* context */}
      <NewBranch
        open={openNewBranch.open}
        close={() => setOpenNewBranch({ open: false, data: null })}
        onSave={handleNewBranch}
        data={openNewBranch.data}
      />
    </>
  );
};

export default Report;
