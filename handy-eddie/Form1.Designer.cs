namespace handy_eddie
{
    partial class Form1
    {
        /// <summary>
        ///  Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;
        private PictureBox pictureBoxQR;
        private TextBox textBoxLog;
        private Label labelUrlPrefix;
        private TextBox textBoxUrl;
        private Button buttonStart;
        private Button buttonStop;
        private NumericUpDown numericUpDownPort;
        private Label labelPort;
        private CheckBox checkBoxDebugLog;
        private CheckBox checkBoxSecureMode;
        private Button buttonCopyUrl;

        /// <summary>
        ///  Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        ///  Required method for Designer support - do not modify
        ///  the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(Form1));
            pictureBoxQR = new PictureBox();
            textBoxLog = new TextBox();
            labelUrlPrefix = new Label();
            textBoxUrl = new TextBox();
            buttonStart = new Button();
            buttonStop = new Button();
            labelPort = new Label();
            numericUpDownPort = new NumericUpDown();
            checkBoxDebugLog = new CheckBox();
            checkBoxSecureMode = new CheckBox();
            buttonCopyUrl = new Button();
            ((System.ComponentModel.ISupportInitialize)pictureBoxQR).BeginInit();
            ((System.ComponentModel.ISupportInitialize)numericUpDownPort).BeginInit();
            SuspendLayout();
            // 
            // pictureBoxQR
            // 
            pictureBoxQR.BorderStyle = BorderStyle.FixedSingle;
            pictureBoxQR.Location = new Point(12, 50);
            pictureBoxQR.Name = "pictureBoxQR";
            pictureBoxQR.Size = new Size(300, 300);
            pictureBoxQR.SizeMode = PictureBoxSizeMode.StretchImage;
            pictureBoxQR.TabIndex = 0;
            pictureBoxQR.TabStop = false;
            // 
            // textBoxLog
            // 
            textBoxLog.Location = new Point(330, 50);
            textBoxLog.Multiline = true;
            textBoxLog.Name = "textBoxLog";
            textBoxLog.ReadOnly = true;
            textBoxLog.ScrollBars = ScrollBars.Vertical;
            textBoxLog.Size = new Size(458, 388);
            textBoxLog.TabIndex = 1;
            textBoxLog.WordWrap = true;
            // 
            // labelUrlPrefix
            // 
            labelUrlPrefix.AutoSize = true;
            labelUrlPrefix.Location = new Point(12, 362);
            labelUrlPrefix.Name = "labelUrlPrefix";
            labelUrlPrefix.Size = new Size(67, 15);
            labelUrlPrefix.TabIndex = 10;
            labelUrlPrefix.Text = "Server URL:";
            // 
            // textBoxUrl
            // 
            textBoxUrl.Location = new Point(85, 360);
            textBoxUrl.Name = "textBoxUrl";
            textBoxUrl.ReadOnly = true;
            textBoxUrl.Size = new Size(227, 23);
            textBoxUrl.TabIndex = 2;
            textBoxUrl.Text = "";
            // 
            // buttonStart
            // 
            buttonStart.Location = new Point(12, 12);
            buttonStart.Name = "buttonStart";
            buttonStart.Size = new Size(100, 30);
            buttonStart.TabIndex = 4;
            buttonStart.Text = "Start Server";
            buttonStart.UseVisualStyleBackColor = true;
            buttonStart.Click += buttonStart_Click;
            // 
            // buttonStop
            // 
            buttonStop.Enabled = false;
            buttonStop.Location = new Point(118, 12);
            buttonStop.Name = "buttonStop";
            buttonStop.Size = new Size(100, 30);
            buttonStop.TabIndex = 5;
            buttonStop.Text = "Stop Server";
            buttonStop.UseVisualStyleBackColor = true;
            buttonStop.Click += buttonStop_Click;
            // 
            // labelPort
            // 
            labelPort.AutoSize = true;
            labelPort.Location = new Point(240, 18);
            labelPort.Name = "labelPort";
            labelPort.Size = new Size(32, 15);
            labelPort.TabIndex = 6;
            labelPort.Text = "Port:";
            // 
            // numericUpDownPort
            // 
            numericUpDownPort.Location = new Point(278, 15);
            numericUpDownPort.Maximum = new decimal(new int[] { 65535, 0, 0, 0 });
            numericUpDownPort.Minimum = new decimal(new int[] { 1024, 0, 0, 0 });
            numericUpDownPort.Name = "numericUpDownPort";
            numericUpDownPort.Size = new Size(80, 23);
            numericUpDownPort.TabIndex = 7;
            numericUpDownPort.Value = new decimal(new int[] { 8080, 0, 0, 0 });
            // 
            // checkBoxDebugLog
            // 
            checkBoxDebugLog.AutoSize = true;
            checkBoxDebugLog.Location = new Point(380, 18);
            checkBoxDebugLog.Name = "checkBoxDebugLog";
            checkBoxDebugLog.Size = new Size(81, 19);
            checkBoxDebugLog.TabIndex = 8;
            checkBoxDebugLog.Text = "Debug log";
            checkBoxDebugLog.UseVisualStyleBackColor = true;
            checkBoxDebugLog.CheckedChanged += checkBoxDebugLog_CheckedChanged;
            // 
            // checkBoxSecureMode
            // 
            checkBoxSecureMode.AutoSize = true;
            checkBoxSecureMode.Location = new Point(480, 18);
            checkBoxSecureMode.Name = "checkBoxSecureMode";
            checkBoxSecureMode.Size = new Size(95, 19);
            checkBoxSecureMode.TabIndex = 9;
            checkBoxSecureMode.Text = "Secure mode";
            checkBoxSecureMode.UseVisualStyleBackColor = true;
            // 
            // buttonCopyUrl
            // 
            buttonCopyUrl.Enabled = false;
            buttonCopyUrl.Location = new Point(12, 390);
            buttonCopyUrl.Name = "buttonCopyUrl";
            buttonCopyUrl.Size = new Size(100, 30);
            buttonCopyUrl.TabIndex = 10;
            buttonCopyUrl.Text = "Copy URL";
            buttonCopyUrl.UseVisualStyleBackColor = true;
            buttonCopyUrl.Click += buttonCopyUrl_Click;
            // 
            // Form1
            // 
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            ClientSize = new Size(800, 450);
            Controls.Add(buttonCopyUrl);
            Controls.Add(checkBoxSecureMode);
            Controls.Add(checkBoxDebugLog);
            Controls.Add(numericUpDownPort);
            Controls.Add(labelPort);
            Controls.Add(buttonStop);
            Controls.Add(buttonStart);
            Controls.Add(textBoxUrl);
            Controls.Add(labelUrlPrefix);
            Controls.Add(textBoxLog);
            Controls.Add(pictureBoxQR);
            Icon = (Icon)resources.GetObject("$this.Icon");
            Name = "Form1";
            Text = "Handy Eddie - Mobile Mouse Controller";
            FormClosing += Form1_FormClosing;
            Load += Form1_Load;
            ((System.ComponentModel.ISupportInitialize)pictureBoxQR).EndInit();
            ((System.ComponentModel.ISupportInitialize)numericUpDownPort).EndInit();
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion
    }
}
