enum Permission {
    FileSystem,
    SystemHardwareInformation,
    Network,
    Camera,
    Microphone,
    Location,
    Notifications,
    ViewUserInformation,
    SystemSettings,
    PowerSettings,
    ApplicationData
}

export const description: Record<Permission, string> = {
    [Permission.FileSystem]: "Allow the process read and write to and from files, as well as access their metadata",
    [Permission.SystemHardwareInformation]: "Allow the process to view hardware-related information",
    [Permission.Network]: "Allow the process to perform network-related tasks",
    [Permission.Camera]: "Allow the processes to access the system's cameras",
    [Permission.Microphone]: "Allow the process to access the system's microphones",
    [Permission.Location]: "Allow the process to access location-related information",
    [Permission.Notifications]: "Allow the process to read received notifications",
    [Permission.ViewUserInformation]: "Allow the process to access advanced information about the current user",
    [Permission.SystemSettings]: "Allow the process to read and change system settings for the current user",
    [Permission.PowerSettings]: "Allow the process to manage system power",
    [Permission.ApplicationData]: "Allow the system to read and change application settings such as permissions"
}

export default Permission;
