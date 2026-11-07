using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;

namespace PLC Engineering Suite.Weinview
{
public sealed class RecipeViewClipboardResult
{
    public ushort DescriptorFlags { get; internal set; }
    public int DisplayCountOffset { get; internal set; }
    public uint[] Indices { get; internal set; }
    public int EndOffset { get; internal set; }
    public bool ReadbackVerified { get; internal set; }
}

internal sealed class RecipeClipboardBodyReader
{
    private const int MaximumBodyBytes = 32 * 1024 * 1024;
    private const int MaximumStringBytes = 65536;
    private readonly byte[] data;
    private readonly Encoding ansiEncoding;
    private readonly Encoding utf8 = new UTF8Encoding(false, true);
    private readonly Encoding unicode = new UnicodeEncoding(false, false, true);
    private int position;

    private RecipeClipboardBodyReader(byte[] source, int bodyOffset, Encoding ansi)
    {
        if (source == null) throw new ArgumentNullException("source");
        if (ansi == null) throw new ArgumentNullException("ansi");
        if (bodyOffset < 0 || bodyOffset >= source.Length)
            throw new ArgumentOutOfRangeException("bodyOffset");
        if (source.Length - bodyOffset > MaximumBodyBytes)
            throw Unsupported("body exceeds bounded reader limit");
        data = source;
        position = bodyOffset;
        ansiEncoding = ansi;
    }

    private void ReadPrefix()
    {
        if (ReadByte() != 0x43) throw Unsupported("Recipe object type is not 0x43");
        ReadMfcCString();
        ReadByte();
        ReadByte();
        ReadUtf8U16();
        if (ReadUInt16() != 1) throw Unsupported("common version is not 1");
        ReadUtf8U16();
        if (ReadUInt32() != 0) throw Unsupported("nonempty common vector");
        ReadMfcStrings(3);
        ReadBytes(20);
        ReadBytes(3);
        ReadMfcStrings(3);
    }

    internal static RecipeViewClipboardResult Read(byte[] source, int bodyOffset, Encoding ansiEncoding)
    {
        RecipeClipboardBodyReader reader = new RecipeClipboardBodyReader(source, bodyOffset, ansiEncoding);
        RecipeViewClipboardResult result = new RecipeViewClipboardResult();
        reader.ReadPrefix();

        reader.ReadBytes(10);
        for (int i = 0; i < 3; i++) reader.ReadUInt16();
        uint itemCount = reader.ReadUInt32();
        if (itemCount > 4096) throw Unsupported("common item count exceeds limit");
        for (uint i = 0; i < itemCount; i++)
        {
            if (reader.ReadUInt16() != 1) throw Unsupported("common item version is not 1");
            reader.ReadByte(); // item id
            if (reader.ReadUInt16() != 1) throw Unsupported("common inner version is not 1");
            byte itemType = reader.ReadByte();
            if (itemType == 0) reader.ReadBytes(2);
            else if (itemType == 1) reader.ReadBytes(4);
            else if (itemType != 2) throw Unsupported("unknown common item type");
        }
        reader.ReadUInt32();
        reader.ReadMfcCString();
        for (int i = 0; i < 3; i++) reader.ReadUInt32();
        reader.ReadMfcStrings(3);
        for (int i = 0; i < 6; i++) reader.ReadUInt16();
        reader.ReadBytes(11);
        reader.ReadUInt32();
        reader.ReadUInt32();
        reader.ReadBytes(6);
        reader.ReadUInt32();
        reader.ReadBytes(16);
        reader.ReadBytes(4);
        reader.ReadUInt32();
        reader.ReadUInt32();
        reader.ReadMfcCString();

        if (reader.ReadUInt16() != 3) throw Unsupported("Recipe descriptor version is not 3");
        result.DescriptorFlags = reader.ReadUInt16();
        if ((result.DescriptorFlags & 1) != 0) throw Unsupported("Recipe descriptor address branch");
        byte headerFlags = reader.ReadByte();
        if ((headerFlags & ~1) != 0) throw Unsupported("unknown Recipe header flags");
        byte headerExtra = reader.ReadByte();
        if (headerExtra == 1)
        {
            reader.ReadUInt32();
            reader.ReadByte();
        }
        else if (headerExtra != 0) throw Unsupported("unknown Recipe header extra branch");
        if ((headerFlags & 1) != 0)
        {
            if (reader.ReadUInt16() != 2) throw Unsupported("Recipe display text version is not 2");
            reader.ReadByte(); // multilingual
            reader.ReadUtf8U16();
            reader.ReadUtf8U16();
            reader.ReadByte(); // font size
            reader.ReadUInt32(); // color
        }
        result.DisplayCountOffset = reader.position;
        uint displayCount = reader.ReadUInt32();
        if (displayCount > 4096) throw Unsupported("display index count exceeds limit");
        result.Indices = new uint[(int)displayCount];
        for (int i = 0; i < result.Indices.Length; i++) result.Indices[i] = reader.ReadUInt32();
        result.EndOffset = reader.position;
        if (reader.position >= source.Length || source[reader.position] != 0x43)
            throw Unsupported("expected 0x43 after Recipe body");
        result.ReadbackVerified = true;
        return result;
    }

    private static NotSupportedException Unsupported(string detail)
    {
        return new NotSupportedException("Unsupported Recipe clipboard body: " + detail);
    }

    private void Require(int count)
    {
        if (count < 0 || count > data.Length - position)
            throw Unsupported("truncated field at byte offset " + position);
    }

    private byte ReadByte()
    {
        Require(1);
        return data[position++];
    }

    private ushort ReadUInt16()
    {
        Require(2);
        ushort value = (ushort)(data[position] | (data[position + 1] << 8));
        position += 2;
        return value;
    }

    private uint ReadUInt32()
    {
        Require(4);
        uint value = (uint)data[position] | ((uint)data[position + 1] << 8) |
            ((uint)data[position + 2] << 16) | ((uint)data[position + 3] << 24);
        position += 4;
        return value;
    }

    private byte[] ReadBytes(int count)
    {
        Require(count);
        byte[] value = new byte[count];
        Buffer.BlockCopy(data, position, value, 0, count);
        position += count;
        return value;
    }

    private string ReadUtf8U16()
    {
        int count = ReadUInt16();
        byte[] value = ReadBytes(count);
        try { return utf8.GetString(value); }
        catch (DecoderFallbackException) { throw Unsupported("invalid UTF-8 string"); }
    }

    private uint ReadMfcCount()
    {
        byte first = ReadByte();
        if (first != 0xff) return first;
        ushort wide = ReadUInt16();
        return wide == 0xffff ? ReadUInt32() : wide;
    }

    private string ReadMfcCString()
    {
        bool isUnicode = false;
        uint count = ReadMfcCount();
        if (count == 0xfffe)
        {
            isUnicode = true;
            count = ReadMfcCount();
        }
        ulong byteCount = isUnicode ? (ulong)count * 2UL : count;
        if (byteCount > MaximumStringBytes)
            throw Unsupported("MFC CString exceeds bounded reader limit");
        byte[] value = ReadBytes((int)byteCount);
        try { return (isUnicode ? unicode : ansiEncoding).GetString(value); }
        catch (DecoderFallbackException) { throw Unsupported("invalid MFC CString encoding"); }
    }

    private void ReadMfcStrings(int count)
    {
        for (int i = 0; i < count; i++) ReadMfcCString();
    }
}

public static class RecipeViewClipboard
{
    private const int MaximumClipboardBytes = 32 * 1024 * 1024;
    private const uint WM_COMMAND = 0x0111;
    private const uint SMTO_ABORTIFHUNG = 0x0002;
    private const int CopyCommand = 57634;
    private const string ClipboardFormat = "EBClipboardObject";
    private const string RecipeClass = "CPartObject";

    public static RecipeViewClipboardResult DecodeSingle(byte[] clipboard)
    {
        if (clipboard == null) throw new ArgumentNullException("clipboard");
        if (clipboard.Length == 0 || clipboard.Length > MaximumClipboardBytes)
            throw Unsupported("clipboard size outside reader limit");
        int bodyOffset = -1;
        int declarationCount = 0;
        for (int i = 2; i <= clipboard.Length - 7; i++)
        {
            if (clipboard[i] != 0xff || clipboard[i + 1] != 0xff ||
                clipboard[i + 2] != 1 || clipboard[i + 3] != 0) continue;
            int nameLength = clipboard[i + 4] | (clipboard[i + 5] << 8);
            if (nameLength == 0 || nameLength > 128 || i + 6 + nameLength >= clipboard.Length)
                continue;
            bool asciiName = true;
            for (int j = i + 6; j < i + 6 + nameLength; j++)
            {
                byte c = clipboard[j];
                if (!((c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') ||
                      (c >= '0' && c <= '9') || c == '_')) { asciiName = false; break; }
            }
            if (!asciiName) continue;
            declarationCount++;
            if (declarationCount != 1) throw Unsupported("multiple MFC class declarations");
            if ((clipboard[i - 2] | (clipboard[i - 1] << 8)) != 1)
                throw Unsupported("clipboard does not contain one object");
            string className = Encoding.ASCII.GetString(clipboard, i + 6, nameLength);
            if (className != RecipeClass) throw Unsupported("unsupported MFC class " + className);
            bodyOffset = i + 6 + nameLength;
            if (clipboard[bodyOffset] != 0x43) throw Unsupported("unsupported Recipe object type");
        }
        if (declarationCount != 1 || bodyOffset < 0)
            throw Unsupported("single Recipe class declaration absent");
        return RecipeClipboardBodyReader.Read(clipboard, bodyOffset, Encoding.Default);
    }

    public static byte[] Capture(long main, int pid)
    {
        if (main == 0 || pid <= 0) throw new ArgumentOutOfRangeException("main");
        IntPtr window = new IntPtr(main);
        uint actualPid;
        if (GetWindowThreadProcessId(window, out actualPid) == 0 || actualPid != (uint)pid)
            throw Unsupported("main window does not belong to requested process");
        uint before = GetClipboardSequenceNumber();
        IntPtr messageResult;
        if (SendMessageTimeoutW(window, WM_COMMAND, new IntPtr(CopyCommand), IntPtr.Zero,
            SMTO_ABORTIFHUNG, 1000, out messageResult) == IntPtr.Zero)
            throw Unsupported("native Copy command failed or timed out");
        Stopwatch clock = Stopwatch.StartNew();
        uint after = GetClipboardSequenceNumber();
        while (after == before && clock.ElapsedMilliseconds < 1000)
        {
            Thread.Sleep(20);
            after = GetClipboardSequenceNumber();
        }
        if (after == before) throw Unsupported("native Copy did not update clipboard");
        if (!OpenClipboard(IntPtr.Zero)) throw Unsupported("cannot open clipboard");
        try
        {
            IntPtr owner = GetClipboardOwner();
            uint ownerPid;
            if (owner == IntPtr.Zero || GetWindowThreadProcessId(owner, out ownerPid) == 0 || ownerPid != (uint)pid)
                throw Unsupported("clipboard owner is not requested process");
            uint format = RegisterClipboardFormatW(ClipboardFormat);
            if (format == 0) throw Unsupported("EBClipboardObject format unavailable");
            IntPtr handle = GetClipboardData(format);
            if (handle == IntPtr.Zero) throw Unsupported("EBClipboardObject data absent");
            ulong size = GlobalSize(handle).ToUInt64();
            if (size == 0 || size > MaximumClipboardBytes)
                throw Unsupported("EBClipboardObject size outside limit");
            IntPtr address = GlobalLock(handle);
            if (address == IntPtr.Zero) throw Unsupported("cannot lock clipboard data");
            try
            {
                byte[] bytes = new byte[(int)size];
                Marshal.Copy(address, bytes, 0, bytes.Length);
                if (GetClipboardSequenceNumber() != after)
                    throw Unsupported("clipboard changed during Copy readback");
                return bytes;
            }
            finally { GlobalUnlock(handle); }
        }
        finally { CloseClipboard(); }
    }

    private static NotSupportedException Unsupported(string detail)
    {
        return new NotSupportedException("Unsupported Recipe clipboard: " + detail);
    }

    [DllImport("user32.dll", SetLastError = true)]
    private static extern uint GetWindowThreadProcessId(IntPtr window, out uint processId);
    [DllImport("user32.dll", SetLastError = true)]
    private static extern uint GetClipboardSequenceNumber();
    [DllImport("user32.dll", CharSet = CharSet.Unicode, SetLastError = true, EntryPoint = "SendMessageTimeoutW")]
    private static extern IntPtr SendMessageTimeoutW(IntPtr window, uint message, IntPtr wParam,
        IntPtr lParam, uint flags, uint timeout, out IntPtr result);
    [DllImport("user32.dll", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool OpenClipboard(IntPtr newOwner);
    [DllImport("user32.dll", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool CloseClipboard();
    [DllImport("user32.dll", SetLastError = true)]
    private static extern IntPtr GetClipboardOwner();
    [DllImport("user32.dll", CharSet = CharSet.Unicode, SetLastError = true, EntryPoint = "RegisterClipboardFormatW")]
    private static extern uint RegisterClipboardFormatW(string format);
    [DllImport("user32.dll", SetLastError = true)]
    private static extern IntPtr GetClipboardData(uint format);
    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern UIntPtr GlobalSize(IntPtr handle);
    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern IntPtr GlobalLock(IntPtr handle);
    [DllImport("kernel32.dll", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool GlobalUnlock(IntPtr handle);
}
}
