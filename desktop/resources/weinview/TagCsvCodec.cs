using System;
using System.IO;
using System.Text;
using System.Collections.Generic;

namespace PLCCode.Weinview {
 public sealed class TagRow {
  public string name {get;set;}
  public string device {get;set;}
  public string address_type {get;set;}
  public string address {get;set;}
  public string comment {get;set;}
  public string data_type {get;set;}
  public string[] Fields(){return new[]{name,device,address_type,address,comment,data_type};}
 }
 // The six-column, headerless UTF8-BOM envelope was exported by CN421 itself.
 // Preserve opaque native fields on reads; new binding validation belongs to UI.
 public static class TagCsvCodec {
  public static TagRow[] Read(string path){
   byte[] bytes=File.ReadAllBytes(path);
   if(bytes.Length<3 || bytes.Length>4194304 || bytes[0]!=239 || bytes[1]!=187 || bytes[2]!=191)throw new Exception("Native tag CSV requires bounded UTF8 BOM");
   return Parse(new UTF8Encoding(false,true).GetString(bytes,3,bytes.Length-3));
  }
  public static TagRow[] Parse(string text){
   if(text==null || text.Length>4194304)throw new Exception("Tag CSV size exceeded");
   var rows=new List<TagRow>();var fields=new List<string>();var field=new StringBuilder();
   bool quoted=false,closed=false,started=false;
   for(int i=0;i<text.Length;i++){
    char c=text[i];
    if(quoted){if(c=='"'){if(i+1<text.Length && text[i+1]=='"'){field.Append('"');i++;}else{quoted=false;closed=true;}}else field.Append(c);continue;}
    if(c==',' || c=='\r' || c=='\n'){
     fields.Add(field.ToString());field.Length=0;closed=false;started=false;
     if(c!=','){if(c=='\r' && i+1<text.Length && text[i+1]=='\n')i++;AddRow(rows,fields);fields.Clear();}
     continue;
    }
    if(closed)throw new Exception("Text after closing tag CSV quote");
    if(c=='"'){if(started || field.Length!=0)throw new Exception("Quote inside unquoted tag CSV field");quoted=true;started=true;}
    else{field.Append(c);started=true;}
   }
   if(quoted)throw new Exception("Unterminated tag CSV quote");
   if(fields.Count!=0 || started || closed || field.Length!=0){fields.Add(field.ToString());AddRow(rows,fields);}
   var names=new HashSet<string>(StringComparer.Ordinal);
   foreach(var row in rows)if(!names.Add(row.name))throw new Exception("Duplicate native tag name");
   return rows.ToArray();
  }
  static void AddRow(List<TagRow> rows,List<string> f){
   if(f.Count!=6 || String.IsNullOrEmpty(f[0]) || f[0].Length>256 || rows.Count>=4096)throw new Exception("Native tag CSV requires unique six-field rows");
   foreach(string v in f)if(v.Length>65536 || v.IndexOf('\0')>=0)throw new Exception("Native tag field outside bound");
   rows.Add(new TagRow{name=f[0],device=f[1],address_type=f[2],address=f[3],comment=f[4],data_type=f[5]});
  }
  static string Quote(string value){
   if(value==null)throw new Exception("Missing tag field");
   return value.IndexOfAny(new[]{',','"','\r','\n'})>=0 ? "\""+value.Replace("\"","\"\"")+"\"" : value;
  }
  public static void Write(string path,TagRow[] rows){
   if(rows==null || rows.Length<1 || rows.Length>1000)throw new Exception("One to 1000 tag requests required");
   var text=new StringBuilder();
   foreach(var row in rows){string[] f=row.Fields();for(int i=0;i<6;i++){if(i!=0)text.Append(',');text.Append(Quote(f[i]));}text.Append("\r\n");}
   var bytes=new UTF8Encoding(true,true).GetBytes(text.ToString());
   using(var file=new FileStream(path,FileMode.CreateNew,FileAccess.Write,FileShare.None)){byte[] bom={239,187,191};file.Write(bom,0,3);file.Write(bytes,0,bytes.Length);}
  }
  public static TagRow[] Merge(TagRow[] before,TagRow[] requested){
   var result=new List<TagRow>(before);var keys=new Dictionary<string,int>(StringComparer.Ordinal);
   for(int i=0;i<result.Count;i++)keys.Add(result[i].name,i);
   var folded=new HashSet<string>(StringComparer.OrdinalIgnoreCase);foreach(var row in before)folded.Add(row.name);
   var unique=new HashSet<string>(StringComparer.OrdinalIgnoreCase);
   foreach(var row in requested){
    if(!unique.Add(row.name))throw new Exception("Duplicate request tag name");
    int at;if(keys.TryGetValue(row.name,out at))result[at]=row;
    else{if(folded.Contains(row.name))throw new Exception("Case-only native tag name collision");keys.Add(row.name,result.Count);folded.Add(row.name);result.Add(row);}
   }
   if(result.Count>4096)throw new Exception("Merged tag count exceeded");return result.ToArray();
  }
  public static void AssertSame(TagRow[] expected,TagRow[] actual){
   if(expected.Length!=actual.Length)throw new Exception("Native full tag count differs");
   var lookup=new Dictionary<string,TagRow>(StringComparer.Ordinal);foreach(var row in actual)lookup.Add(row.name,row);
   foreach(var row in expected){TagRow found;if(!lookup.TryGetValue(row.name,out found))throw new Exception("Native expected tag missing");string[] a=row.Fields(),b=found.Fields();for(int i=0;i<6;i++)if(a[i]!=b[i])throw new Exception("Native full tag field differs: "+row.name+" column "+i);}
  }
 }
}
