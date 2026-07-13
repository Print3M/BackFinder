# BackFinder - WORK IN PROGRESS...

TODO:

- Child process
- Extensions filtering

Vulnerabilities to output (`--only-writable`):

- Looking for a file in writable dir
- Reading writable file
- Looking for a dir in writable dir
- Loading writable DLL
- Enumerating writable dir
- Executing writable image (EXE, DLL)
- Spawning shell with writable .ps1, .cmd

```text

--- No handle ---
+ NtCreateFile              
+ NtOpenFile                
+ NtCreateUserProcess
+ NtQueryAttributesFile       
+ NtQueryFullAttributesFile   
+ NtDeleteFile                
+ RtlSetCurrentDirectory_U
+ LdrLoadDll

LoadLibrary / LoadModule

--- Handle required ---
NtQueryDirectoryFile        
NtQueryDirectoryFileEx      
NtQueryInformationFile      
NtSetInformationFile        
NtClose                     

--- Not applicable ---
NtCreateProcess             (copy process, not loading image)      
NtCreateProcessEx           (copy process, not loading image)
NtOpenDirectoryObject       (nothing to do with the filesystem)
NtCreateDirectoryObject     (nothing to do with the filesystem)
NtCreateDirectoryObjectEx   (nothing to do with the filesystem)
```
