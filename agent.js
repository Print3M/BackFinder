📦
3598 /src/agent/index.js
✄
// src/ntdll/NtCreateFileIoStatus.ts
var NtCreateFileIoStatus = {
  FILE_SUPERSEDED: 0,
  FILE_OPENED: 1,
  FILE_CREATED: 2,
  FILE_OVERWRITTEN: 3,
  FILE_EXISTS: 4,
  FILE_DOES_NOT_EXIST: 5
};
var IO_STATUS_INFORMATION_NAMES = Object.fromEntries(Object.entries(NtCreateFileIoStatus).map(([name, value]) => [value, name]));
var readIoStatusBlock = (ptr) => {
  return {
    status: ptr.readS32(),
    information: ptr.add(Process.pointerSize).readPointer().toUInt32()
  };
};

// src/shared/unicode.ts
var readUnicodeString = (ptr) => {
  const unicode = {
    length: ptr.readU16(),
    maximumLength: ptr.add(2).readU16(),
    // 4 bytes padding after MaximumLength
    buffer: ptr.add(8).readPointer()
  };
  return unicodeStringToStr(unicode);
};
var unicodeStringToStr = (str) => {
  if (str.buffer.isNull() || str.length === 0)
    return "";
  return str.buffer.readUtf16String(str.length / 2) ?? "<unreadable>";
};

// src/ntdll/ObjectAttributes.ts
var FIELDS_OFFSET = {
  ObjectName: 16
};
var readObjectAttributes = (ptr) => {
  return {
    objectName: readUnicodeString(ptr.add(FIELDS_OFFSET.ObjectName).readPointer())
  };
};

// src/ntdll/RtlUserProcessParameters.ts
var FIELDS_OFFSET2 = {
  ImagePathName: 96,
  CommandLine: 112
};
var readRtlUserProcessParameters = (ptr) => {
  return {
    imagePathName: readUnicodeString(ptr.add(FIELDS_OFFSET2.ImagePathName)),
    commandLine: readUnicodeString(ptr.add(FIELDS_OFFSET2.CommandLine))
  };
};

// src/agent/index.ts
var NTDLL = Process.getModuleByName("ntdll.dll");
var pNtCreateFile = NTDLL.getExportByName("NtCreateFile");
Interceptor.attach(pNtCreateFile, {
  onEnter(args) {
    this.desiredAccess = args[1].toUInt32();
    this.path = readObjectAttributes(args[2]).objectName;
    this.pIoStatus = args[3];
    this.objectAttributes = args[2].toUInt32();
    this.createDisposition = args[7].toUInt32();
  },
  onLeave(retval) {
    const { information } = readIoStatusBlock(this.pIoStatus);
    const status = retval.toUInt32() >>> 0;
    const event = {
      fn: "NtCreateFile",
      path: this.path,
      desiredAccess: this.desiredAccess,
      createDisposition: this.createDisposition,
      ioStatusBlockInformation: information,
      status
    };
    send(event);
  }
});
console.log("[agent] NtCreateFile hooked in pid " + Process.id);
var pNtOpenFile = NTDLL.getExportByName("NtOpenFile");
Interceptor.attach(pNtOpenFile, {
  onEnter(args) {
    this.desiredAccess = args[1].toUInt32();
    this.path = readObjectAttributes(args[2]).objectName;
    this.pIoStatus = args[3];
  },
  onLeave(retval) {
    const { information } = readIoStatusBlock(this.pIoStatus);
    const status = retval.toUInt32() >>> 0;
    const event = {
      fn: "NtOpenFile",
      path: this.path,
      desiredAccess: this.desiredAccess,
      ioStatusBlockInformation: information,
      status
    };
    send(event);
  }
});
console.log("[agent] NtOpenFile hooked in pid " + Process.id);
var pNtCreateUserProcess = NTDLL.getExportByName("NtCreateUserProcess");
Interceptor.attach(pNtCreateUserProcess, {
  onEnter(args) {
    const rtlUserProcessParameters = readRtlUserProcessParameters(args[8]);
    this.imagePath = rtlUserProcessParameters.imagePathName;
    this.commandLine = rtlUserProcessParameters.commandLine;
  },
  onLeave(retval) {
    const status = retval.toUInt32() >>> 0;
    const event = {
      fn: "NtCreateUserProcess",
      status,
      imagePath: this.imagePath,
      commandLine: this.commandLine
    };
    send(event);
  }
});
console.log("[agent] NtCreateUserProccess hooked in pid " + Process.id);
