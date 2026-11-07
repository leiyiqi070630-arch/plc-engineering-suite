using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace PLC Engineering Suite.Weinview {
 public sealed class PictureLibraryState {
  public string path { get; set; }
  public string expected_sha256 { get; set; }
  public byte[] png { get; set; }
  public string sha256 { get; set; }
  public int width { get; set; }
  public int height { get; set; }
  public int offset { get; set; }
 }
 public sealed class PictureLibraryPicture {
  public string name { get; set; }
  public PictureLibraryState[] states { get; set; }
 }
 // This is the observed FLBX v3 / ASCII / PNG state envelope only. The three
 // native values below are opaque constants; their vendor meaning is unknown.
 public static class PictureLibraryCodec {
  const int MaxPngBytes = 5 * 1024 * 1024;
  const int MaxTotalPngBytes = 32 * 1024 * 1024;
  static readonly byte[] Signature = {137,80,78,71,13,10,26,10};
  public static string Sha256(byte[] bytes) {
   using (var sha = SHA256.Create()) return BitConverter.ToString(sha.ComputeHash(bytes)).Replace("-", "");
  }
  static uint U32BE(byte[] bytes, int offset) {
   return ((uint)bytes[offset] << 24) | ((uint)bytes[offset+1] << 16) | ((uint)bytes[offset+2] << 8) | bytes[offset+3];
  }
  static uint Crc(byte[] bytes, int offset, int length) {
   uint crc = 0xffffffff;
   for (int i = offset; i < offset + length; i++) {
    crc ^= bytes[i];
    for (int bit = 0; bit < 8; bit++) crc = (crc >> 1) ^ ((crc & 1) != 0 ? 0xedb88320u : 0u);
   }
   return ~crc;
  }
  public static void ValidatePng(PictureLibraryState state) {
   var data = state.png;
   if (data == null || data.Length < 67 || data.Length > MaxPngBytes) throw new Exception("PNG resource byte bound exceeded.");
   for (int i = 0; i < Signature.Length; i++) if (data[i] != Signature[i]) throw new Exception("PNG signature required.");
   int at = 8, chunks = 0, idat = 0, width = 0, height = 0;
   bool ended = false, leftIdat = false;
   while (at < data.Length) {
    if (++chunks > 4096 || data.Length - at < 12) throw new Exception("Invalid bounded PNG chunks.");
    uint length = U32BE(data, at);
    if (length > (uint)(data.Length - at - 12)) throw new Exception("Truncated PNG chunk.");
    int body = at + 8, end = body + (int)length;
    string kind = Encoding.ASCII.GetString(data, at + 4, 4);
    for (int i = at + 4; i < at + 8; i++) if (!((data[i] >= 65 && data[i] <= 90) || (data[i] >= 97 && data[i] <= 122))) throw new Exception("Invalid PNG chunk type.");
    if (Crc(data, at + 4, (int)length + 4) != U32BE(data, end)) throw new Exception("PNG chunk CRC differs.");
    if (chunks == 1) {
     if (kind != "IHDR" || length != 13) throw new Exception("PNG IHDR required first.");
     uint w = U32BE(data, body), h = U32BE(data, body + 4);
     if (w == 0 || h == 0 || w > 4096 || h > 4096 || (ulong)w * h > 16777216) throw new Exception("PNG dimensions exceed qualified bound.");
     width = (int)w; height = (int)h;
     int depth = data[body + 8], color = data[body + 9];
     bool valid = (color == 0 && (depth == 1 || depth == 2 || depth == 4 || depth == 8 || depth == 16)) ||
                  (color == 2 && (depth == 8 || depth == 16)) ||
                  (color == 3 && (depth == 1 || depth == 2 || depth == 4 || depth == 8)) ||
                  ((color == 4 || color == 6) && (depth == 8 || depth == 16));
     if (!valid || data[body + 10] != 0 || data[body + 11] != 0 || data[body + 12] != 0) throw new Exception("PNG IHDR encoding outside supported profile.");
    } else if (kind == "IHDR") throw new Exception("Duplicate PNG IHDR.");
    if (kind == "acTL" || kind == "fcTL" || kind == "fdAT") throw new Exception("Animated PNG is outside the finite profile.");
    if (kind == "IDAT") { if (leftIdat) throw new Exception("PNG IDAT chunks must be consecutive."); idat++; }
    else if (idat > 0) leftIdat = true;
    if (kind == "IEND") {
     if (length != 0 || idat == 0 || end + 4 != data.Length) throw new Exception("Whole PNG with IDAT and terminal IEND required.");
     ended = true; break;
    }
    if ((data[at + 4] & 32) == 0 && kind != "IHDR" && kind != "PLTE" && kind != "IDAT") throw new Exception("Unknown critical PNG chunk.");
    at = end + 4;
   }
   if (!ended) throw new Exception("PNG IEND missing.");
   using (var stream = new MemoryStream(data, false))
   using (var image = Image.FromStream(stream, true, true)) {
    if (image.RawFormat.Guid != System.Drawing.Imaging.ImageFormat.Png.Guid || image.Width != width || image.Height != height) throw new Exception("PNG decoder and IHDR dimensions differ.");
    // Force pixel decoding rather than accepting only a syntactically valid header.
    using (var bitmap = new Bitmap(image)) { bitmap.GetPixel(width - 1, height - 1); }
   }
   state.width = width; state.height = height; state.sha256 = Sha256(data);
   if (!String.Equals(state.sha256, state.expected_sha256, StringComparison.OrdinalIgnoreCase)) throw new Exception("PNG expected SHA256 differs.");
  }
  static void Ascii(BinaryWriter writer, string value) {
   if (String.IsNullOrEmpty(value) || value.Length > 128) throw new Exception("Bounded nonempty ASCII text required.");
   for (int i = 0; i < value.Length; i++) if (value[i] < 32 || value[i] > 126) throw new Exception("Printable ASCII library name required.");
   var bytes = Encoding.ASCII.GetBytes(value); writer.Write((ushort)bytes.Length); writer.Write(bytes);
  }
  public static byte[] Build(PictureLibraryPicture[] pictures) {
   if (pictures == null || pictures.Length < 1 || pictures.Length > 32) throw new Exception("One to 32 pictures required.");
   var names = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
   int total = 0;
   using (var stream = new MemoryStream())
   using (var writer = new BinaryWriter(stream, Encoding.ASCII, true)) {
    writer.Write((ushort)3); Ascii(writer, "flbx"); writer.Write((ushort)1); writer.Write((uint)pictures.Length);
    foreach (var picture in pictures) {
     if (picture == null || !names.Add(picture.name ?? "") || picture.states == null || picture.states.Length < 1 || picture.states.Length > 16) throw new Exception("Unique picture name and one to 16 states required.");
     writer.Write((ushort)1); Ascii(writer, picture.name); writer.Write((uint)picture.states.Length);
     foreach (var state in picture.states) {
      if (state == null) throw new Exception("PNG state required.");
      ValidatePng(state); total = checked(total + state.png.Length);
      if (total > MaxTotalPngBytes) throw new Exception("Total PNG resource bound exceeded.");
      writer.Write((ushort)1); Ascii(writer, "PNG");
      writer.Write((uint)2); writer.Write((uint)0); writer.Write((uint)0xffffff);
      writer.Write((uint)state.png.Length); state.offset = checked((int)stream.Position); writer.Write(state.png);
     }
    }
    writer.Flush(); return stream.ToArray();
   }
  }
 }
}
